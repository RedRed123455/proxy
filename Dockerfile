# Use Node.js LTS as base image
FROM node:18-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "proxy.js"]
