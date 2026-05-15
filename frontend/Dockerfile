# syntax=docker/dockerfile:1
# watchToNext frontend — Next.js (App Router, standalone output).
# Build context: the `frontend/` directory.

# ---- dependencies --------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ---------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so
# they must be present in the environment here (Railway injects service
# variables into the Docker build).
RUN npm run build

# ---- runtime -------------------------------------------------------------
FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
# Bind all interfaces so the container is reachable (Next defaults HOSTNAME
# to localhost otherwise, which breaks container networking).
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# `output: "standalone"` emits a minimal server + only the node_modules it
# needs. `public/` and `.next/static` are not bundled — copy them explicitly.
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
