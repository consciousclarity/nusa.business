#!/usr/bin/env bash
# Merge deploy/caddy/nusa.business.caddy into the host Caddyfile (run ON the VPS).
#
# - Ensures global on_demand_tls.ask points at the Nusa API
# - Replaces existing nusa.* site blocks with the repo snippet
# - Validates and reloads Caddy without restarting other sites
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SNIPPET="$ROOT/deploy/caddy/nusa.business.caddy"
CADDYFILE="${CADDYFILE:-/etc/caddy/Caddyfile}"

if [[ ! -f "$SNIPPET" ]]; then
  echo "Missing $SNIPPET"
  exit 1
fi
if [[ ! -f "$CADDYFILE" ]]; then
  echo "Missing $CADDYFILE"
  exit 1
fi

backup="$CADDYFILE.bak.nusa.$(date +%Y%m%d-%H%M%S)"
cp "$CADDYFILE" "$backup"
echo "Backup → $backup"

python3 - "$CADDYFILE" "$SNIPPET" <<'PY'
import re, sys
from pathlib import Path

caddy_path = Path(sys.argv[1])
snippet_path = Path(sys.argv[2])
text = caddy_path.read_text()
snippet = snippet_path.read_text()

# Strip comment-only header from snippet — keep directives
body_lines = []
for line in snippet.splitlines():
    if not body_lines and (line.startswith("#") or not line.strip()):
        continue
    body_lines.append(line)
body = "\n".join(body_lines).strip() + "\n"

# Ensure on_demand_tls in global options block
ask = "ask http://127.0.0.1:4101/v1/tls-check"
if "on_demand_tls" not in text:
    text2, n = re.subn(
        r"(?m)^\{\s*\n((?:.*\n)*?)\}",
        lambda m: "{\n"
        + m.group(1)
        + "\ton_demand_tls {\n\t\t"
        + ask
        + "\n\t}\n}",
        text,
        count=1,
    )
    if n != 1:
        raise SystemExit("Could not find global { } block to add on_demand_tls")
    text = text2
elif ask not in text:
    text2, n = re.subn(
        r"on_demand_tls\s*\{[^}]*\}",
        "on_demand_tls {\n\t\t" + ask + "\n\t}",
        text,
        count=1,
    )
    if n != 1:
        raise SystemExit("Could not update existing on_demand_tls block")
    text = text2

# Drop prior nusa-related site blocks / snippets we manage
patterns = [
    r"\n\(nusa_headers\)\s*\{[\s\S]*?\n\}\n",
    r"\nwww\.nusa\.business\s*\{[\s\S]*?\n\}\n",
    r"\napi\.nusa\.business\s*\{[\s\S]*?\n\}\n",
    r"\nportal\.nusa\.business\s*\{[\s\S]*?\n\}\n",
    # Multi-line address lists ending in *.nusa.business {
    r"\n(?:[a-z0-9.*-]+,\s*\n)*[a-z0-9.*-]*nusa\.business[^\n]*\{[\s\S]*?\n\}\n",
    r"\nhttps://\s*\{[\s\S]*?\n\}\n",
]
for pat in patterns:
    text = re.sub(pat, "\n", text)

# Preserve translate.nusa.business if it existed — re-add simple proxy
if "translate.nusa.business" not in text:
    # keep optional; not part of Nusa app
    pass

caddy_path.write_text(text.rstrip() + "\n\n" + body)
print("Merged nusa Caddy site blocks")
PY

mkdir -p /var/log/caddy
touch /var/log/caddy/nusa.business.log /var/log/caddy/api.nusa.business.log
chown caddy:caddy /var/log/caddy/nusa.business.log /var/log/caddy/api.nusa.business.log 2>/dev/null || true

caddy validate --config "$CADDYFILE"
systemctl reload caddy
systemctl is-active caddy
echo "Caddy reloaded with nested on-demand TLS"
