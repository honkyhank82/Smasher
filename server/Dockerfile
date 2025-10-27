FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY src ./src

# Build with SWC (faster than tsc)
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install build tools
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# List what we have
RUN echo "=== Files in dist ===" && find dist -type f -name "*.js" | head -20

# Expose port
EXPOSE 3001

# Start with node - try both possible paths
CMD sh -c "if [ -f dist/main.js ]; then node dist/main.js; else node dist/src/main.js; fi"
