FROM node:20-alpine AS base
WORKDIR /app

FROM base AS development
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 4203
CMD ["npx", "vite", "--host"]
