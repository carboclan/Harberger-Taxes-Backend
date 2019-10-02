FROM node:10.16.3

RUN mkdir /app
COPY package.json /app
RUN cd /app && npm i

ADD . /app/

WORKDIR /app
ENTRYPOINT node
