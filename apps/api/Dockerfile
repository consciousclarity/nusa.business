FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY apps/api/package.json apps/api/
RUN npm install --ignore-scripts --workspace=@nusa/shared --workspace=@nusa/db --workspace=@nusa/api

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN npm run build -w @nusa/shared \
  && npm run build -w @nusa/db \
  && npm run build -w @nusa/api

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8787
ENV NUSA_DATA_DIR=/data
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/api ./apps/api
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY apps/api/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && mkdir -p /data
VOLUME ["/data"]
EXPOSE 8787
ENTRYPOINT ["/entrypoint.sh"]
