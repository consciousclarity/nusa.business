# Backfill listing coordinates (production store)

**Cursor / agents must not run this against the VPS.** Hermes (Warden on the
Hostinger box) pastes the command below.

Live discovery (`GET .../businesses/:slug/discovery`) returns `origin: null`
and an empty `similar` list when a listing has no `lat`/`lng`. Production
`store.json` is never re-seeded; only migrations run. This script fills
**missing** coordinates in place (`0,0` counts as missing).

## What it does

1. Copies `store.json` to `/var/backups/nusa/store.json.<UTC stamp>` (same
   pattern as [runtime-verification.md](./runtime-verification.md)).
2. Matches seed coords by **business id**, then **slug** (exact pins, no jitter).
3. Remaining listings get a **place centroid** (`island:slug` so Bali Kuta ≠
   Lombok Kuta) plus ~50–150 m deterministic jitter so map pins do not stack
   (still well inside 2 km). Island, then Indonesia, if the place is unknown.
4. Atomic write (`temp` + `fsync` + `rename` + `store.json.bak`), same as C07.
5. Does **not** overwrite existing finite coords unless `--force`.

Standalone Node: `scripts/backfill-listing-coords.mjs` does not import
`@nusa/db`. Curl it from GitHub if `/opt/nusa.business` does not have this
file yet — no git pull or deploy required.

## Hermes command (copy-paste)

```bash
sudo install -d -m 700 /var/backups/nusa
sudo cp -a /opt/nusa.business/.data/store.json \
  "/var/backups/nusa/store.json.$(date -u +%Y%m%dT%H%M%SZ)"

curl -fsSL \
  https://raw.githubusercontent.com/consciousclarity/nusa.business/cursor/backfill-listing-coords-e34d/scripts/backfill-listing-coords.mjs \
  -o /tmp/backfill-listing-coords.mjs

node /tmp/backfill-listing-coords.mjs \
  --store /opt/nusa.business/.data/store.json \
  --backup-dir /var/backups/nusa \
  --dry-run

node /tmp/backfill-listing-coords.mjs \
  --store /opt/nusa.business/.data/store.json \
  --backup-dir /var/backups/nusa

pm2 ls
# confirm the API process name, then:
pm2 reload api
```

`getStore()` re-reads `store.json` on every request, so the reload is
optional. Reload anyway so workers that might cache in memory pick it up.

Expect JSON `stillMissing: 0`. Default is fill-missing; do not pass `--force`
unless an operator explicitly wants to overwrite existing pins.

After merge to `main`, the curl URL works with `/main/` instead of the branch
name, or run `node scripts/backfill-listing-coords.mjs …` from the checkout.

## Verify Ibu Oka discovery

```bash
curl -sS \
  'https://api.nusa.business/v1/islands/bali/places/ubud/businesses/warung-babi-guling-ibu-oka/discovery' \
  | python3 -c 'import json,sys; d=json.load(sys.stdin); print("origin", d.get("origin")); print("similar", len(d.get("similar") or []))'
```

Expect `origin` with non-null `lat`/`lng` (seed: `-8.5069`, `115.2625`).
`similar` is non-empty only when another same-category listing also has
coords within 2 km — empty `similar` after a successful origin is OK if live
Ubud has no such peer.

Loopback if Caddy/Cloudflare is in the way (`pm2 ls` for the API port):

```bash
curl -sS \
  'http://127.0.0.1:8787/v1/islands/bali/places/ubud/businesses/warung-babi-guling-ibu-oka/discovery' \
  || curl -sS \
  'http://127.0.0.1:4101/v1/islands/bali/places/ubud/businesses/warung-babi-guling-ibu-oka/discovery'
```

## Flags

| Flag | Purpose |
|---|---|
| `--store PATH` | `store.json` (default: `$NUSA_DATA_DIR/store.json` or `/opt/nusa.business/.data/store.json`) |
| `--backup-dir DIR` | Timestamped copy (default `/var/backups/nusa`) |
| `--seed PATH` | Optional `seed-data.ts` overlay (still no `@nusa/db`) |
| `--force` | Overwrite listings that already have coordinates |
| `--dry-run` | Print JSON plan; do not write |
| `--skip-backup` | Skip timestamped copy (atomic `.bak` still written on a real run) |

## Restore

```bash
# pick the stamp you just wrote
sudo cp -a /var/backups/nusa/store.json.YYYYMMDDTHHMMSSZ \
  /opt/nusa.business/.data/store.json
pm2 reload api
```

## Local check

```bash
node --test tests/scripts.backfill-listing-coords.test.mjs
```
