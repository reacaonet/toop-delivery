FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src/ ./src/
RUN mkdir -p /app/storage
EXPOSE 8500
CMD ["node", "src/server.js"]
