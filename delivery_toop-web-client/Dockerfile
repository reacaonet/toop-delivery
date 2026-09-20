FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./

FROM base AS development

RUN npm install

COPY . .

EXPOSE 4200

CMD ["npx", "vite", "--host"]

FROM base AS build

RUN npm install

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]