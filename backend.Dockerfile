# =============================================================
# backend.Dockerfile — Node.js / Fastify (TypeScript, pnpm)
# Place this file inside your ecommerce-backend/ folder
# Entry point: dist/server.js
# =============================================================

# =============================================================
# Stage 1: deps — install ALL dependencies (including dev)
# Needed because devDependencies (typescript, @types/*, etc.)
# are required to run the build in Stage 2.
# =============================================================
FROM node:20-alpine AS deps

WORKDIR /app

# Enable pnpm via corepack (ships with Node 20, no extra install needed)
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile


# =============================================================
# Stage 2: builder — compile TypeScript → dist/
# =============================================================
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# set -e makes the build fail loudly if tsc errors out,
# instead of silently continuing with no dist/ output.
RUN set -e && pnpm run build

# Sanity check — confirms dist/server.js exists before moving on.
RUN test -f dist/server.js || (echo "ERROR: dist/server.js not found after build" && exit 1)


# =============================================================
# Stage 3: prod-deps — production-only node_modules
# Strips devDependencies to keep the final image small.
# =============================================================
FROM node:20-alpine AS prod-deps

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod


# =============================================================
# Stage 4: runner — minimal production image
# =============================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# wget is required for the docker-compose healthcheck
RUN apk add --no-cache wget

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 fastify

COPY --from=builder --chown=fastify:nodejs /app/dist ./dist
COPY --from=prod-deps --chown=fastify:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=fastify:nodejs /app/package.json ./package.json

USER fastify

EXPOSE 5000

CMD ["node", "dist/server.js"]
