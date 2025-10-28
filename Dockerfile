FROM node:18-alpine AS builder

WORKDIR /app

# Copy server package and build configs
COPY server/package*.json ./
COPY server/tsconfig*.json ./
COPY server/nest-cli.json ./

# Install dependencies for build
RUN npm ci

# Copy server source
COPY server/src ./src

# Build
RUN npm run build

# --- Production stage ---
FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copy server package files
COPY server/package*.json ./

# Install only production deps
RUN npm ci --only=production && npm cache clean --force

# Copy built app
COPY --from=builder /app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/main.js"]