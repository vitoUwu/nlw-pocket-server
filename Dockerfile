FROM node:20-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

RUN npm run build

ENV ADDRESS=0.0.0.0
ENV PORT=3333

EXPOSE 3333

CMD ["npm", "start"]