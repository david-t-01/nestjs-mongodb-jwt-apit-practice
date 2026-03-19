FROM node:lts-jod AS base

# Step 1. Build
FROM base AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY src ./src
COPY public ./public
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

RUN npm run build

# Step 2. Production image
FROM base AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nestjs \
    && adduser --system --uid 1001 nestjs

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public

COPY --from=builder --chown=nestjs:nestjs /app/dist ./dist
COPY --from=builder /app/package.json ./

RUN chown nestjs:nestjs public

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]