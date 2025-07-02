# https://docs.colyseus.io/deployment#docker

FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# run without dev dependencies
FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /usr/src/app/build ./build

EXPOSE 2567

# CMD [ "npm", "start" ]
CMD ["node", "build/index.js"]
