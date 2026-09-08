#!/usr/bin/env bash
# Read-only health check for the Nusa stack on the VPS (run ON the server).
#
#   bash /opt/nusa.business/scripts/vps-status.sh
#   ssh nusa 'bash /opt/nusa.business/scripts/vps-status.sh'
#
# Changes nothing. Exits non-zero if any check fails, so it is safe to use
# as a post-deploy gate.

set -uo pipefail

API_PORT="${API_PORT:-4101}"
WEB_PORT="${WEB_PORT:-4321}"
PORTAL_PORT="${PORTAL_PORT:-4103}"
COMPOSE_FILE="${COMPOSE_FILE:-/opt/nusa.business/docker/compose.prod.yml}"

fails=0
pass() { printf '  \033[32mok\033[0m   %s\n' "$1"; }
fail() { printf '  \033[31mFAIL\033[0m %s\n' "$1"; fails=$((fails + 1)); }

echo "== containers / supervisor =="
pm2_seen=0
compose_seen=0
if command -v pm2 >/dev/null 2>&1; then
  if pm2 jlist 2>/dev/null | grep -Eqi 'nusa|web|api|portal'; then
    pass "pm2 present (inspect: pm2 ls)"
    pm2_seen=1
  fi
fi
if [ -f "$COMPOSE_FILE" ]; then
  if docker compose -f "$COMPOSE_FILE" ps 2>/dev/null | grep -Eqi 'Up|running'; then
    pass "compose stack has running services ($COMPOSE_FILE)"
    compose_seen=1
  else
    docker compose -f "$COMPOSE_FILE" ps 2>/dev/null || fail "docker compose ps"
  fi
else
  if [ "$pm2_seen" -eq 1 ]; then
    pass "compose file absent; PM2 runtime assumed"
  else
    fail "compose file not found at $COMPOSE_FILE"
  fi
fi
if [ "$pm2_seen" -eq 1 ] && [ "$compose_seen" -eq 1 ]; then
  fail "both PM2 and Compose look active — confirm intended runtime before deploy"
elif [ "$pm2_seen" -eq 0 ] && [ "$compose_seen" -eq 0 ]; then
  fail "neither PM2 nusa apps nor Compose services detected"
fi

if [ -d /opt/nusa.business/.git ]; then
  echo
  echo "== git (app tree) =="
  sha=$(git -C /opt/nusa.business rev-parse HEAD 2>/dev/null || true)
  if [ -n "$sha" ]; then
    pass "HEAD $sha"
  else
    fail "could not read git HEAD under /opt/nusa.business"
  fi
fi

echo
echo "== loopback upstreams =="
for entry in "api:${API_PORT}:/health" "web:${WEB_PORT}:/" "portal:${PORTAL_PORT}:/"; do
  name="${entry%%:*}"
  rest="${entry#*:}"
  port="${rest%%:*}"
  path="${rest#*:}"
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:${port}${path}" 2>/dev/null)
  if [ "$code" = "200" ]; then
    pass "$name 127.0.0.1:${port}${path} → $code"
  else
    fail "$name 127.0.0.1:${port}${path} → ${code:-no response}"
  fi
done

echo
echo "== tls ask endpoint =="
# Include a Java place host: after jawa→java, a missing DNS wildcard made
# /v1/tls-check look fine while public HTTPS handshake-failed at Cloudflare.
for probe in \
  "nusa.business:200" \
  "gianyar.bali.nusa.business:200" \
  "jakarta.java.nusa.business:200" \
  "nope.invalid:404"
do
  domain="${probe%:*}"
  want="${probe##*:}"
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 \
    "http://127.0.0.1:${API_PORT}/v1/tls-check?domain=${domain}" 2>/dev/null)
  if [ "$code" = "$want" ]; then
    pass "tls-check $domain → $code"
  else
    fail "tls-check $domain → ${code:-no response} (want $want)"
  fi
done

echo
echo "== host caddy =="
if systemctl is-active --quiet caddy; then
  pass "caddy service active"
else
  fail "caddy service not active"
fi
if caddy validate --config /etc/caddy/Caddyfile >/dev/null 2>&1; then
  pass "Caddyfile valid"
else
  fail "Caddyfile invalid (caddy validate --config /etc/caddy/Caddyfile)"
fi

echo
echo "== public endpoints =="
# Place hosts must be grey-cloud + origin LE. If *.java is missing, this URL
# fails TLS at Cloudflare even though the origin serves the page correctly.
for url in \
  "https://nusa.business/" \
  "https://api.nusa.business/health" \
  "https://portal.nusa.business/" \
  "https://gianyar.bali.nusa.business/" \
  "https://jakarta.java.nusa.business/"
do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$url" 2>/dev/null)
  case "$code" in
    200 | 301 | 302) pass "$url → $code" ;;
    *) fail "$url → ${code:-no response}" ;;
  esac
done

echo
echo "== capacity =="
free -h | awk 'NR<=2'
df -h / | awk 'NR<=2'

echo
if [ "$fails" -eq 0 ]; then
  echo "All checks passed."
else
  echo "$fails check(s) failed."
fi
exit "$fails"
