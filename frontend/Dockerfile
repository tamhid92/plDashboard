# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22-alpine
ARG NGINX_IMAGE=nginx:1.27-alpine

# ---------- Build stage ----------
FROM node:${NODE_VERSION} AS build
WORKDIR /app

# Leverage cache for deps
COPY package.json package-lock.json* ./
RUN npm ci

# Build with /api as base URL, NO API token in bundle
ARG VITE_BASE_URL=/api
ENV VITE_BASE_URL=$VITE_BASE_URL

COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM ${NGINX_IMAGE}
LABEL version="1.0" \
      maintainer="Tamhid Chowdhury <tamhidchowdhury@gmail.com>" \
      description="Web Application for English Premier League Data Analytics" \
      org.opencontainers.image.source="https://github.com/tamhid92/pldashboard"

EXPOSE 8080

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config as template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy entrypoint script (with exec permissions already set)
COPY --chmod=755 docker-entrypoint.sh /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]