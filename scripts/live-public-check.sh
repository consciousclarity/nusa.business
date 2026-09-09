#!/usr/bin/env bash
# Read-only public HTTPS checks for nusa.business launch gates.
# Does not deploy, mutate the VPS, or require SSH.
#
#   bash scripts/live-public-check.sh
#
# Until the launch-readiness follow-up is deployed, homepage, listing /id,
# sitemap, and robots.txt checks are expected to FAIL (old resolver chrome;
# listing /id still English labels; sitemap still /host/; robots allows /search).
# Listing API-origin checks may already pass.

set -uo pipefail

HOME_URL="${LIVE_HOME_URL:-https://nusa.business/}"
HOME_ID_URL="${LIVE_HOME_ID_URL:-https://nusa.business/id}"
LISTING_URL="${LIVE_LISTING_URL:-https://gianyar.bali.nusa.business/babi-guling-pande-egi}"
LISTING_ID_URL="${LIVE_LISTING_ID_URL:-https://gianyar.bali.nusa.business/id/babi-guling-pande-egi}"
API_HEALTH_URL="${LIVE_API_HEALTH_URL:-https://api.nusa.business/health}"
SITEMAP_URL="${LIVE_SITEMAP_URL:-https://nusa.business/sitemap.xml}"
ROBOTS_URL="${LIVE_ROBOTS_URL:-https://nusa.business/robots.txt}"

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

  if printf '%s' "$html" | grep -q 'class="nav-search"'; then
    pass "$label header has Search (nav-search)"
  else
    fail "$label header missing Search (nav-search)"
  fi
}

echo "== live public check (read-only) =="
echo "home    $HOME_URL"
echo "home/id $HOME_ID_URL"
echo "listing $LISTING_URL"
echo "list/id $LISTING_ID_URL"
echo "sitemap $SITEMAP_URL"
echo "robots  $ROBOTS_URL"
echo

home=$(fetch "$HOME_URL")
check_home "homepage" "$HOME_URL" "$home"

home_id=$(fetch "$HOME_ID_URL")
check_home "homepage /id" "$HOME_ID_URL" "$home_id"

if [ -n "$home_id" ]; then
  if printf '%s' "$home_id" | grep -q 'Pulau Dewata'; then
    pass "homepage /id has Indonesian Bali tagline Pulau Dewata"
  else
    fail "homepage /id missing Indonesian Bali tagline Pulau Dewata"
  fi

  if printf '%s' "$home_id" | grep -q 'Cari bisnis'; then
    pass "homepage /id has Indonesian search chrome Cari bisnis"
  else
    fail "homepage /id missing Indonesian search chrome Cari bisnis"
  fi

  if printf '%s' "$home_id" | grep -q 'Jawa'; then
    pass "homepage /id has Indonesian island name Jawa"
  else
    fail "homepage /id missing Indonesian island name Jawa"
  fi
fi

check_listing_origin() {
  local label="$1"
  local url="$2"
  local html="$3"

  if [ -z "$html" ]; then
    fail "GET $url (empty body)"
    return 1
  fi
  pass "GET $url (${#html} bytes)"

  if printf '%s' "$html" | grep -q 'http://api:8787'; then
    fail "$label HTML contains http://api:8787 (browser API origin)"
  else
    pass "$label HTML does not contain http://api:8787"
  fi

  if printf '%s' "$html" | grep -q 'https://api.nusa.business'; then
    pass "$label HTML embeds https://api.nusa.business"
  else
    fail "$label HTML missing https://api.nusa.business"
  fi
}

listing=$(fetch "$LISTING_URL")
check_listing_origin "listing" "$LISTING_URL" "$listing"

listing_id=$(fetch "$LISTING_ID_URL")
check_listing_origin "listing /id" "$LISTING_ID_URL" "$listing_id"

if printf '%s' "$listing_id" | grep -qE 'Food &amp; Drink|Food & Drink'; then
  fail "listing /id still has English Food & Drink category"
else
  pass "listing /id has no English Food & Drink category"
fi

if printf '%s' "$listing_id" | grep -qE 'Makanan|Warung'; then
  pass "listing /id has Indonesian category label"
else
  fail "listing /id missing Indonesian category label (Makanan or Warung)"
fi

if [ -n "$listing_id" ]; then
  if printf '%s' "$listing_id" | grep -q '>Status</dt>'; then
    fail "listing /id still has Status dt (resolver jargon)"
  else
    pass "listing /id has no Status dt"
  fi

  if printf '%s' "$listing_id" | grep -q '>Booking</dt>'; then
    fail "listing /id still has Booking dt (resolver jargon)"
  else
    pass "listing /id has no Booking dt"
  fi

  if printf '%s' "$listing_id" | grep -q '>Host</dt>'; then
    fail "listing /id still has Host dt (resolver jargon)"
  else
    pass "listing /id has no Host dt"
  fi

  if printf '%s' "$listing_id" | grep -q '/host/bali'; then
    fail "listing /id still points at /host/bali"
  else
    pass "listing /id does not link /host/bali"
  fi

  if printf '%s' "$listing_id" | grep -q '>Address</dt>'; then
    fail "listing /id still has English Address label"
  else
    pass "listing /id has no English Address dt"
  fi

  if printf '%s' "$listing_id" | grep -q '>Alamat</dt>'; then
    pass "listing /id has Indonesian Alamat label"
  else
    fail "listing /id missing Indonesian Alamat label"
  fi

  if printf '%s' "$listing_id" | grep -q 'Review scores'; then
    fail "listing /id still has English Review scores"
  else
    pass "listing /id has no English Review scores"
  fi

  if printf '%s' "$listing_id" | grep -q 'Nilai ulasan'; then
    pass "listing /id has Indonesian review chrome Nilai ulasan"
  else
    fail "listing /id missing Indonesian review chrome Nilai ulasan"
  fi

  if printf '%s' "$listing_id" | grep -qE '>Mon</th>|>Mon</'; then
    fail "listing /id still has English weekday Mon"
  else
    pass "listing /id has no English weekday Mon"
  fi

  if printf '%s' "$listing_id" | grep -qE '>Sen</th>|>Sen</'; then
    pass "listing /id has Indonesian weekday Sen"
  else
    fail "listing /id missing Indonesian weekday Sen"
  fi
fi

code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "$API_HEALTH_URL" 2>/dev/null || true)
if [ "$code" = "200" ]; then
  pass "GET $API_HEALTH_URL → 200"
else
  fail "GET $API_HEALTH_URL → ${code:-no response}"
fi

sitemap=$(fetch "$SITEMAP_URL")
if [ -z "$sitemap" ]; then
  fail "GET $SITEMAP_URL (empty body)"
else
  pass "GET $SITEMAP_URL (${#sitemap} bytes)"
  if printf '%s' "$sitemap" | grep -q '/host/bali'; then
    fail "sitemap still lists /host/bali (nested hosts not deployed)"
  else
    pass "sitemap has no /host/bali"
  fi
  if printf '%s' "$sitemap" | grep -q 'https://bali.nusa.business'; then
    pass "sitemap lists https://bali.nusa.business"
  else
    fail "sitemap missing https://bali.nusa.business"
  fi
  if printf '%s' "$sitemap" | grep -q 'https://bali.nusa.business/id'; then
    pass "sitemap lists Indonesian Bali hub"
  else
    fail "sitemap missing https://bali.nusa.business/id"
  fi
  if printf '%s' "$sitemap" | grep -q 'https://gianyar.bali.nusa.business/babi-guling-pande-egi'; then
    pass "sitemap lists nested listing loc"
  else
    fail "sitemap missing nested listing loc"
  fi
fi

robots=$(fetch "$ROBOTS_URL")
if [ -z "$robots" ]; then
  fail "GET $ROBOTS_URL (empty body)"
else
  pass "GET $ROBOTS_URL (${#robots} bytes)"
  if printf '%s' "$robots" | grep -q 'Sitemap: https://nusa.business/sitemap.xml'; then
    pass "robots.txt points at apex sitemap"
  else
    fail "robots.txt missing Sitemap: https://nusa.business/sitemap.xml"
  fi
  if printf '%s' "$robots" | grep -q 'Disallow: /search'; then
    pass "robots.txt Disallow /search"
  else
    fail "robots.txt missing Disallow: /search"
  fi
  if printf '%s' "$robots" | grep -q 'Disallow: /id/search'; then
    pass "robots.txt Disallow /id/search"
  else
    fail "robots.txt missing Disallow: /id/search"
  fi
fi

echo
if [ "$fails" -eq 0 ]; then
  echo "Live public checks passed. Operator store/restore/Search Console still separate."
else
  echo "$fails live public check(s) failed. Cursor must not deploy; hand remaining gates to an authorized operator."
fi
exit "$fails"
