# Use Node.js 18 LTS as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps --omit=dev && npm cache clean --force

# Development stage
FROM base AS development
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 8400
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --legacy-peer-deps --omit=dev && npm cache clean --force

# Copy built application
COPY --from=build --chown=nodejs:nodejs /usr/src/app/dist ./dist

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

EXPOSE 8400

CMD ["node", "dist/index.js"]
