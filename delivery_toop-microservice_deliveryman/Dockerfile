# Deliveryman - Multi-stage build
FROM node:18-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer-deps --omit=dev && npm cache clean --force

FROM base AS development
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 8300
CMD ["npm", "run", "dev"]

FROM base AS build
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:18-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer-deps --omit=dev && npm cache clean --force
COPY --from=build --chown=nodejs:nodejs /usr/src/app/dist ./dist
COPY --from=base --chown=nodejs:nodejs /usr/src/app/healthcheck.js ./healthcheck.js
USER nodejs
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node healthcheck.js
EXPOSE 8300
CMD ["node", "dist/index.js"]
