#!/usr/bin/env bash
# Devcontainer bootstrap. Idempotent — safe to re-run.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Installing workspace dependencies"
npm install --ignore-scripts

echo "==> Building shared packages"
npm run build:packages

# The portal is a client-side SPA: VITE_API_URL is resolved in the *browser*,
# which is not inside this container, so localhost:8787 is unreachable from the
# page on Codespaces.
#
# The fix is NOT to forward the API port publicly — the seed creates fixed demo
# accounts with published passwords, so a public API port hands an admin token
# to anyone who learns the URL. Instead the portal calls its OWN forwarded
# origin, and the Vite dev server proxies /v1 and /health to the API inside the
# container (apps/portal/vite.config.ts). Same origin, no exposed port.
#
# Astro renders server-side, so it talks to the API over localhost directly.
if [ -n "${CODESPACE_NAME:-}" ]; then
  DOMAIN="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
  PORTAL_URL="https://${CODESPACE_NAME}-5173.${DOMAIN}"
  WEB_URL="https://${CODESPACE_NAME}-4321.${DOMAIN}"
  # Portal talks to itself; the dev server proxies through to :8787.
  API_URL="$PORTAL_URL"
  echo "==> Codespace detected; portal proxies the API via ${PORTAL_URL}"
else
  API_URL="http://localhost:8787"
  PORTAL_URL="http://localhost:5173"
  WEB_URL="http://localhost:4321"
  echo "==> Local devcontainer; API at ${API_URL}"
fi

if [ ! -f .env ]; then
  cp .env.example .env
fi

# Rewrite the URL keys in place, appending any that are missing.
set_env() {
  local key="$1" value="$2"
  if grep -q "^${key}=" .env; then
    sed -i "s|^${key}=.*|${key}=${value}|" .env
  else
    printf '%s=%s\n' "$key" "$value" >> .env
  fi
}

set_env VITE_API_URL "$API_URL"
# Astro renders server-side inside this container, so it uses localhost even on
# Codespaces — no forwarded port involved.
set_env PUBLIC_API_URL "http://localhost:8787"
set_env PUBLIC_PORTAL_URL "$PORTAL_URL"

# Dev-only signing secret. Production supplies its own and the API refuses to
# start without one when NODE_ENV=production.
if ! grep -qE '^NUSA_AUTH_SECRET=.+' .env; then
  set_env NUSA_AUTH_SECRET "$(openssl rand -hex 32)"
fi

echo "==> Seeding the JSON store"
npm run seed

cat <<'EOF'

Ready. Start the three services in separate terminals:
(the portal proxies /v1 to the API, so start dev:api first)

  npm run dev:api      # 8787
  npm run dev:web      # 4321
  npm run dev:portal   # 5173

Tenancy uses dev paths, not subdomains — a Codespaces hostname parses as
"unknown" by design:

  /host/bali
  /host/gianyar.bali
  /host/gianyar.bali/babi-guling-pande-egi

Demo logins: owner@example.com/owner123 · agent@nusa.business/agent123
             admin@nusa.business/admin123

No port is forwarded publicly. These are fixed, published credentials, so a
public API port would hand an admin token to anyone with the URL.

One known gap on Codespaces: the review / booking form on a listing page is
browser-side and reads PUBLIC_API_URL, which points at localhost for SSR. That
widget will not reach the API from a browser tab. Everything else — browsing,
search, the whole portal — works. Fixing it properly needs a server/client
split in apps/web/src/lib/api.ts.

Run the checks CI runs:  npm run build && npm test
EOF
