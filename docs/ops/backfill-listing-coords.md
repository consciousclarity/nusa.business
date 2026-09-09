# Backfill listing coordinates (Warden)

**Warden** is the Hermes agent on the Hostinger VPS (`/opt/nusa.business`, PM2).
This runbook is for Warden, not a local Cursor agent.

Live listing discovery (`Similar businesses within 2 km`) needs `lat`/`lng` on
the origin listing **and** on peers. Production `store.json` was created before
seed pins existed, so `/discovery` returns `"origin": null` until this backfill
runs. Do **not** re-seed (`NUSA_ALLOW_DEMO_SEED=1` wipes live listings). Do
**not** deploy from Cursor.

Script: `scripts/backfill-listing-coords.mjs` (standalone Node, no `@nusa/db`).

- Default: fill **missing** coords only (`0,0` counts as missing).
- Seed match: business `id`, then `slug` (exact seed pins, no jitter).
- Else place centroid (island+slug so Bali Kuta ≠ Lombok Kuta), else island
  centroid, else Indonesia fallback — each with ~50–150 m deterministic jitter.
- Atomic write + sibling `store.json.bak` (same idea as `packages/db` persist).
- `getStore()` re-reads disk every request; `pm2 reload api` is optional.

## Paste this to Warden

```text
Warden — you are the Hermes agent on this VPS. Backfill missing lat/lng on every
listing in the live JSON store so listing-page discovery (similar within 2 km)
can resolve an origin. Do not re-seed, do not wipe store.json, do not enable
NUSA_ALLOW_DEMO_SEED, do not git reset --hard, do not change PM2 env.

1. Backup (required):
   sudo install -d -m 700 /var/backups/nusa
   sudo cp -a /opt/nusa.business/.data/store.json \
     "/var/backups/nusa/store.json.$(date -u +%Y%m%dT%H%M%SZ)"

2. cd /opt/nusa.business
   If scripts/backfill-listing-coords.mjs is missing, write it from the nusa.business
   repo file of that name (do not pull/deploy the whole tree unless an operator
   already asked). Prefer the file already on disk when present.

3. Dry-run, then write:
   node scripts/backfill-listing-coords.mjs --store /opt/nusa.business/.data/store.json --dry-run
   node scripts/backfill-listing-coords.mjs --store /opt/nusa.business/.data/store.json

   Expect remaining=0. Default is fill-missing; do not pass --force unless an
   operator explicitly wants to overwrite existing pins.

4. Optional (getStore re-reads disk anyway):
   pm2 ls
   pm2 reload api

5. Verify:
   curl -sS "https://api.nusa.business/v1/islands/bali/places/ubud/businesses/warung-babi-guling-ibu-oka/discovery"
   origin must be non-null (lat/lng). similar[] is non-empty only when another
   same-category listing also has coords within 2 km — empty similar after a
   successful origin is OK if live Ubud has no such peer.

Reply with: backup path, JSON summary from the script, discovery origin, and
whether pm2 reload ran.
```

## One-liner (after the script is on disk)

```bash
sudo install -d -m 700 /var/backups/nusa \
  && sudo cp -a /opt/nusa.business/.data/store.json \
    "/var/backups/nusa/store.json.$(date -u +%Y%m%dT%H%M%SZ)" \
  && node /opt/nusa.business/scripts/backfill-listing-coords.mjs \
    --store /opt/nusa.business/.data/store.json
```

## Local check

```bash
node --test tests/scripts.backfill-listing-coords.test.mjs
```
