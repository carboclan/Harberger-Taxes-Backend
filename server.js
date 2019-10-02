const Koa = require('koa');
const json = require('koa-json');
const route = require('koa-route');

const db = require('./src/db');

const app = new Koa();
app.use(json());

app.use(route.get('/api/list_boards', async ctx => {
  const { networkId } = ctx.query;
  const boards = await db.models.aaboard.findAll({ where: { networkId } });
  ctx.body = boards;
}));

console.log('App is listening on 3000.');
app.listen(3000);
