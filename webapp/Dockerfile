# ── Stage 1: builder ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (layer-cache friendly)
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the source
COPY . .

# NEXT_PUBLIC_TILES_BASE_PATH controls the tile URL prefix used by the client.
# It defaults to /tiles, which Caddy will proxy to the tileserv upstream.
ARG NEXT_PUBLIC_TILES_BASE_PATH=/tiles
ENV NEXT_PUBLIC_TILES_BASE_PATH=${NEXT_PUBLIC_TILES_BASE_PATH}

# Build the static export (output goes to ./out)
RUN STATIC_EXPORT=1 npm run build

# ── Stage 2: server ───────────────────────────────────────────────────────────
FROM caddy:2-alpine

# Copy the Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Copy the static export produced by Next.js
COPY --from=builder /app/out /srv

EXPOSE 80
EXPOSE 443
