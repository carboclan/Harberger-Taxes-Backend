const config = require('config');
const { BigNumber } = require('@0x/utils');
const { HttpProvider } = require('ethjs');
const { AABoardEvents, getAABoardWrapper } = require('@carboclan/harberger-taxes-contract-wrapper');

const db = require('./src/db');

(async function () {
  await db.init();
  const networkId = config.get('networkId');
  const rpcUrl = config.get('rpc')[networkId];
  const provider = new HttpProvider(rpcUrl);
  const aab = await getAABoardWrapper(provider);

  async function updateBoard(id) {
    const owner = await aab.ownerOf.callAsync(id);
    const [parentId, price, deposit, lastTaxPayTimestamp, content, taxRate] = await aab.getAdBoardData.callAsync(id);
    const board = { id: id.toNumber(), networkId, owner, parentId, price, deposit, lastTaxPayTimestamp: new Date(lastTaxPayTimestamp.toNumber() * 1000), content, taxRate };
    await db.models.aaboard.upsert(board);
  }

  async function eventListener(evt) {
    const id = new BigNumber(evt.topics[1]);
    await updateBoard(id);
  }

  aab.subscribe(AABoardEvents.BuyEvent, {}, eventListener, true);
  aab.subscribe(AABoardEvents.CreateEvent, {}, eventListener, true);
  aab.subscribe(AABoardEvents.TaxPayEvent, {}, eventListener, true);
  aab.subscribe(AABoardEvents.ChangePriceEvent, {}, eventListener, true);
  aab.subscribe(AABoardEvents.ChangeContentEvent, {}, eventListener, true);
  aab.subscribe(AABoardEvents.AddDepositEvent, {}, eventListener, true);
  aab.subscribe(AABoardEvents.WithdrawDepositEvent, {}, eventListener, true);

  const total = await aab.totalSupply.callAsync();
  for (let i = 0; i < total; i++) {
    await updateBoard(new BigNumber(i));
  }
})();
