#!/usr/bin/env bash
# Deploy Nusa.Business to the Hostinger VPS (run ON the server).
#
# The host's systemd Caddy owns :80/:443 and reverse-proxies to the loopback
# ports this stack publishes. See deploy/caddy/nusa.business.caddy.
#
# Usage:
#   git clone https://github.com/consciousclarity/nusa.business.git /opt/nusa.business
#   cd /opt/nusa.business
#   cp .env.example .env && edit .env   # set NUSA_AUTH_SECRET
#   bash scripts/deploy-vps.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

COMPOSE="docker compose -f docker/compose.prod.yml"
API_PORT="${API_PORT:-4101}"
WEB_PORT="${WEB_PORT:-4321}"
PORTAL_PORT="${PORTAL_PORT:-4103}"

echo "==> Nusa deploy on $(hostname)"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Install Docker Engine first:"
  echo "  curl -fsSL https://get.docker.com | sh"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin required."
  exit 1
fi

# Load .env so NUSA_AUTH_SECRET is available to compose.
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

if [ -z "${NUSA_AUTH_SECRET:-}" ]; then
  echo "ERROR: NUSA_AUTH_SECRET is not set."
  echo "  Generate one and put it in .env:"
  echo "    echo \"NUSA_AUTH_SECRET=\$(openssl rand -hex 32)\" >> .env"
  exit 1
fi

if [ "${#NUSA_AUTH_SECRET}" -lt 16 ]; then
  echo "ERROR: NUSA_AUTH_SECRET must be at least 16 characters."
  exit 1
fi

# The host Caddy owns 80/443; this stack must never try to bind them.
if grep -qE '^\s*-\s*"(80|443):' docker/compose.prod.yml; then
  echo "ERROR: compose.prod.yml binds a public web port."
  echo "  The host Caddy owns :80/:443 — publish to 127.0.0.1 only."
  exit 1
fi

echo "==> Building and starting production stack"
$COMPOSE up -d --build

echo "==> Waiting for API health on 127.0.0.1:${API_PORT}"
ok=0
for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${API_PORT}/health" >/dev/null 2>&1; then
    ok=1
    break
  fi
  sleep 2
done

if [ "$ok" -ne 1 ]; then
  echo "API did not become healthy. Recent logs:"
  $COMPOSE logs --tail 40 api
  exit 1
fi

echo "==> API healthy"
$COMPOSE ps

cat <<EOF

Upstreams now listening on loopback:
  api     127.0.0.1:${API_PORT}
  web     127.0.0.1:${WEB_PORT}
  portal  127.0.0.1:${PORTAL_PORT}

Next, if the host Caddy is not yet pointed at them:
  1. Merge deploy/caddy/nusa.business.caddy into /etc/caddy/Caddyfile
     (including the on_demand_tls block in global options)
  2. caddy validate --config /etc/caddy/Caddyfile
  3. systemctl reload caddy

Then verify from outside:
  curl -sI https://nusa.business/
  curl -s  https://api.nusa.business/health
  curl -sI https://gianyar.bali.nusa.business/
EOF
