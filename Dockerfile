FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install 

FROM node:20-alpine3.20

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

COPY --from=0 /app/node_modules /app/node_modules

COPY . .

RUN npm install -g pm2

RUN  mkdir accepted inbox outbox

COPY .env-docker ./.env

COPY ecosystem.config.js-sample ./ecosystem.config.js

EXPOSE 3002

CMD [ "pm2-runtime" , "start", "ecosystem.config.js" ]