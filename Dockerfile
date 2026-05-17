FROM node:22

WORKDIR /app


COPY package*.json ./


RUN npm install --ignore-scripts --legacy-peer-deps

COPY . ./

RUN npm run build

EXPOSE 2222

CMD ["node", "dist/index.js"]