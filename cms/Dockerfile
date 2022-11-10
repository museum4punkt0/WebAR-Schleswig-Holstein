FROM node:16-alpine

RUN mkdir /app
WORKDIR /app

COPY . .

RUN npm install

ENV NODE_ENV=production

RUN npm run build

CMD npm run start

EXPOSE 80