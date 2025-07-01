# https://docs.colyseus.io/deployment#docker

FROM node:22-alpine

WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# RUN npm ci
# run this for production
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 2567

# CMD [ "npm", "start" ]
CMD ["node", "build/index.js"]
