# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN apk add --no-cache libc6-compat
RUN npm install

# Copy source and prisma schema
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/app/prisma/dev.db"
ENV PRISMA_CLI_QUERY_ENGINE_TYPE="library"
ENV PRISMA_CLIENT_ENGINE_TYPE="library"
RUN npm run build

# Stage 2: Runner
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/app/data/prod.db"

# Copy only what is needed for the runtime
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.js ./prisma.config.js

# Install CLI tools needed for runtime DB push and seed
RUN npm install prisma@7.8.0 tsx dotenv
# Ensure data directory exists
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Start command
# We use the node_modules bundled in standalone for server.js
# and the ones in the root (which standalone provides) for prisma/tsx
CMD npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts && node server.js
