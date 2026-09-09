#!/usr/bin/env bash
# Read-only local/dev smoke for the three Nusa processes.
# Does not start services and does not touch production.
#
#   bash scripts/local-runtime-smoke.sh

set -uo pipefail

API_URL="${API_URL:-http://127.0.0.1:8787}"
WEB_URL="${WEB_URL:-http://127.0.0.1:4321}"
PORTAL_URL="${PORTAL_URL:-http://127.0.0.1:5173}"

fails=0
pass() { printf '  ok   %s\n' "$1"; }
fail() { printf '  FAIL %s\n' "$1"; fails=$((fails + 1)); }

probe() {
  local name="$1" url="$2" want="${3:-200}"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$url" 2>/dev/null || true)
  if [ "$code" = "$want" ]; then
    pass "$name $url → $code"
  else
    fail "$name $url → ${code:-no response} (want $want)"
  fi
}

echo "== local runtime smoke =="
probe api "${API_URL}/health"
probe web "${WEB_URL}/"
probe web-host "${WEB_URL}/host/gianyar.bali"

# Portal is optional in some agent sessions.
code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "${PORTAL_URL}/" 2>/dev/null || true)
if [ "$code" = "200" ] || [ "$code" = "302" ]; then
  pass "portal ${PORTAL_URL}/ → $code"
else
  printf '  skip portal %s → %s\n' "${PORTAL_URL}/" "${code:-no response}"
fi

echo
if [ "$fails" -eq 0 ]; then
  echo "Local smoke passed."
else
  echo "$fails check(s) failed."
fi
exit "$fails"
