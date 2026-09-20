FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./

FROM base AS development

RUN npm install

COPY . .

EXPOSE 4205

CMD ["npx", "vite", "--host"]

FROM base AS build

RUN npm install

COPY . .

ARG VITE_CLIENT_URL
ARG VITE_STORE_URL
ARG VITE_DELIVERYMAN_URL
ARG VITE_ADMIN_URL
ENV VITE_CLIENT_URL=${VITE_CLIENT_URL}
ENV VITE_STORE_URL=${VITE_STORE_URL}
ENV VITE_DELIVERYMAN_URL=${VITE_DELIVERYMAN_URL}
ENV VITE_ADMIN_URL=${VITE_ADMIN_URL}

RUN npm run build

FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]