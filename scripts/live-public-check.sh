#!/usr/bin/env bash
# Read-only public HTTPS checks for nusa.business launch gates.
# Does not deploy, mutate the VPS, or require SSH.
#
#   bash scripts/live-public-check.sh
#
# Until the launch-readiness follow-up is deployed, homepage visitor-chrome
# checks are expected to FAIL (old resolver chrome on both / and /id).
# Listing API-origin checks may already pass.

set -uo pipefail

HOME_URL="${LIVE_HOME_URL:-https://nusa.business/}"
HOME_ID_URL="${LIVE_HOME_ID_URL:-https://nusa.business/id}"
LISTING_URL="${LIVE_LISTING_URL:-https://gianyar.bali.nusa.business/babi-guling-pande-egi}"
API_HEALTH_URL="${LIVE_API_HEALTH_URL:-https://api.nusa.business/health}"

fails=0
pass() { printf '  ok   %s\n' "$1"; }
fail() { printf '  FAIL %s\n' "$1"; fails=$((fails + 1)); }

fetch() {
  local url="$1"
  curl -fsS -A "nusa-live-public-check" --max-time 20 "$url" 2>/dev/null || true
}

check_home() {
  local label="$1"
  local url="$2"
  local html="$3"

  if [ -z "$html" ]; then
    fail "GET $url (empty body)"
    return
  fi
  pass "GET $url (${#html} bytes)"

  if printf '%s' "$html" | grep -q 'class="resolver"'; then
    fail "$label still has class=\"resolver\" (visitor chrome not deployed)"
  else
    pass "$label has no class=\"resolver\""
  fi

  if printf '%s' "$html" | grep -q 'kind=nation'; then
    fail "$label still has kind=nation (host-resolver jargon)"
  else
    pass "$label has no kind=nation"
  fi

  if printf '%s' "$html" | grep -q '/host/bali'; then
    fail "$label still points at /host/bali"
  else
    pass "$label does not link /host/bali"
  fi

  if printf '%s' "$html" | grep -q 'name="q"'; then
    pass "$label has search field name=\"q\""
  else
    fail "$label missing search field name=\"q\""
  fi
}

echo "== live public check (read-only) =="
echo "home    $HOME_URL"
echo "home/id $HOME_ID_URL"
echo "listing $LISTING_URL"
echo

home=$(fetch "$HOME_URL")
check_home "homepage" "$HOME_URL" "$home"

home_id=$(fetch "$HOME_ID_URL")
check_home "homepage /id" "$HOME_ID_URL" "$home_id"

listing=$(fetch "$LISTING_URL")
if [ -z "$listing" ]; then
  fail "GET $LISTING_URL (empty body)"
else
  pass "GET $LISTING_URL (${#listing} bytes)"
fi

if printf '%s' "$listing" | grep -q 'http://api:8787'; then
  fail "listing HTML contains http://api:8787 (browser API origin)"
else
  pass "listing HTML does not contain http://api:8787"
fi

if printf '%s' "$listing" | grep -q 'https://api.nusa.business'; then
  pass "listing HTML embeds https://api.nusa.business"
else
  fail "listing HTML missing https://api.nusa.business"
fi

code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "$API_HEALTH_URL" 2>/dev/null || true)
if [ "$code" = "200" ]; then
  pass "GET $API_HEALTH_URL → 200"
else
  fail "GET $API_HEALTH_URL → ${code:-no response}"
fi

echo
if [ "$fails" -eq 0 ]; then
  echo "Live public checks passed. Operator store/restore/Search Console still separate."
else
  echo "$fails live public check(s) failed. Cursor must not deploy; hand remaining gates to an authorized operator."
fi
exit "$fails"
