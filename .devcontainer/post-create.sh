#!/usr/bin/env bash
# Devcontainer bootstrap. Idempotent — safe to re-run.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Installing workspace dependencies"
npm install --ignore-scripts

echo "==> Building shared packages"
npm run build:packages

# The portal is a client-side SPA: VITE_API_URL is resolved in the *browser*,
# which is not inside this container. On Codespaces, localhost:8787 is therefore
# unreachable from the page and every portal request fails. Point it at the
# forwarded host instead. Astro runs server-side and could use localhost, but
# keeping both on the same URL avoids a confusing split.
if [ -n "${CODESPACE_NAME:-}" ]; then
  DOMAIN="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
  API_URL="https://${CODESPACE_NAME}-8787.${DOMAIN}"
  PORTAL_URL="https://${CODESPACE_NAME}-5173.${DOMAIN}"
  echo "==> Codespace detected; API at ${API_URL}"
else
  API_URL="http://localhost:8787"
  PORTAL_URL="http://localhost:5173"
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
set_env PUBLIC_API_URL "$API_URL"
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

Run the checks CI runs:  npm run build && npm test
EOF
