#!/usr/bin/env bash
# Deploy Nusa.Business to Hostinger VPS (run ON the server).
# Usage:
#   git clone https://github.com/consciousclarity/nusa.business.git /opt/nusa.business
#   cd /opt/nusa.business && bash scripts/deploy-vps.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ORIGIN_IP="${ORIGIN_IP:-62.72.7.218}"

echo "==> Nusa deploy on $(hostname) (expect origin ${ORIGIN_IP})"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Install Docker Engine first:"
  echo "  curl -fsSL https://get.docker.com | sh"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin required."
  exit 1
fi

echo "==> Building and starting production stack"
docker compose -f docker/compose.prod.yml up -d --build

echo "==> Waiting for API health"
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1/api-health 2>/dev/null || \
     docker compose -f docker/compose.prod.yml exec -T api node -e "fetch('http://127.0.0.1:8787/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null; then
    break
  fi
  sleep 2
done

docker compose -f docker/compose.prod.yml ps
echo ""
echo "Done. With Cloudflare DNS → ${ORIGIN_IP} (proxied) and SSL Full:"
echo "  https://nusa.business"
echo "  https://api.nusa.business/health"
echo "  https://portal.nusa.business"
echo "  https://bali.nusa.business  (via /host/bali locally; Host header on prod)"
