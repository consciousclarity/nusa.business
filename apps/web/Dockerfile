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
# Browser-facing origin only — baked into client HTML/JS. Never use Compose DNS.
ARG PUBLIC_BROWSER_API_URL=https://api.nusa.business
ARG PUBLIC_PORTAL_URL=https://portal.nusa.business
ENV PUBLIC_BROWSER_API_URL=$PUBLIC_BROWSER_API_URL
ENV PUBLIC_PORTAL_URL=$PUBLIC_PORTAL_URL
# Build runs in "production" mode; SSR origin is validated at container runtime.
ENV NUSA_SSR_API_URL=http://api:8787
RUN npm run build -w @nusa/shared && npm run build -w @nusa/web

FROM node:22-bookworm-slim
WORKDIR /app
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production
# Runtime SSR talks to the API on the compose network.
ENV NUSA_SSR_API_URL=http://api:8787
ARG PUBLIC_BROWSER_API_URL=https://api.nusa.business
ARG PUBLIC_PORTAL_URL=https://portal.nusa.business
ENV PUBLIC_BROWSER_API_URL=$PUBLIC_BROWSER_API_URL
ENV PUBLIC_PORTAL_URL=$PUBLIC_PORTAL_URL
COPY --from=build /app/apps/web ./apps/web
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
EXPOSE 4321
# Drop root: the SSR server only reads app files and writes sessions to the
# system temp dir, both fine for the unprivileged built-in "node" user.
USER node
CMD ["node", "apps/web/dist/server/entry.mjs"]
