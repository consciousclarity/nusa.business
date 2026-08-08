FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/
RUN npm install --ignore-scripts --workspace=@nusa/shared --workspace=@nusa/web

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web
ENV PUBLIC_API_URL=https://api.nusa.business
ENV PUBLIC_PORTAL_URL=https://portal.nusa.business
RUN npm run build -w @nusa/shared && npm run build -w @nusa/web

FROM node:22-bookworm-slim
WORKDIR /app
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production
ENV PUBLIC_API_URL=https://api.nusa.business
ENV PUBLIC_PORTAL_URL=https://portal.nusa.business
COPY --from=build /app/apps/web ./apps/web
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
EXPOSE 4321
CMD ["node", "apps/web/dist/server/entry.mjs"]
