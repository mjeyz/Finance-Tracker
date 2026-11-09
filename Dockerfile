FROM node:22-alpine
WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ENV port=3000
EXPOSE 3000

CMD ["node", "app.js"]
