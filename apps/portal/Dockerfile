FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/portal/package.json apps/portal/
RUN npm install --ignore-scripts --workspace=@nusa/shared --workspace=@nusa/portal
COPY packages/shared ./packages/shared
COPY apps/portal ./apps/portal
COPY tsconfig.base.json ./
ENV VITE_API_URL=https://api.nusa.business
RUN npm run build -w @nusa/shared && npm run build -w @nusa/portal

FROM caddy:2-alpine
COPY --from=build /app/apps/portal/dist /usr/share/caddy
COPY apps/portal/Caddyfile /etc/caddy/Caddyfile
# Keep any transient Caddy state off root-owned paths, then drop privileges.
ENV XDG_CONFIG_HOME=/tmp XDG_DATA_HOME=/tmp
EXPOSE 8080
USER 1000:1000
