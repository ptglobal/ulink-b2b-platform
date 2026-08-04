# Stage 1: Base & Dependencies
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Stage 2: Builder
FROM base AS builder
WORKDIR /app
COPY . .
ENV NODE_ENV=production
# Next.js build handles static generation and optimization
RUN npm run build

# Stage 3: Runner (Production)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/messages ./messages
COPY --from=builder /app/next.config.mjs ./

EXPOSE 3000

CMD ["npm", "run", "start"]
