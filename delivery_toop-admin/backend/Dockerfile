# Use Node.js 18 LTS as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /home/node/app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Development stage
FROM base AS development
RUN npm install
COPY . .
EXPOSE 8100
CMD ["npm", "run", "start"]

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /home/node/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy application
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

EXPOSE 8100

CMD ["npm", "run", "prod"]
