# Production runtime verification (C13)

**Cursor / agents must not deploy or change the VPS without explicit
authorization.** This page is a read-only checklist.

## Known conflict (2026-09)

Repo docs historically assume **Docker Compose** apps on loopback behind host
Caddy (`docs/ops/vps-deploy.md`, `docker/compose.prod.yml`).

Hermes reconnaissance (2026-09-07) observed **PM2** processes for `web` /
`api` / `portal` under `/opt/nusa.business`, with a stale deploy signal vs
`main`. See [hermes-vps-notes-2026-09-07.md](./hermes-vps-notes-2026-09-07.md).

Until an authorized operator confirms one long-term runtime, treat both as
possible. Backup, rollback, and env wiring differ:

| Concern | Compose (`compose.prod.yml`) | PM2 |
|---|---|---|
| Process | `docker compose … up -d` | `pm2` apps in `/opt/nusa.business` |
| Loopback ports | `4101` api · `4321` web · `4103` portal | Confirm with `ss` / `pm2 show` |
| SSR API URL | Often `http://127.0.0.1:4101` or Compose DNS | Often `http://127.0.0.1:8787` or `4101` |
| Browser API | `https://api.nusa.business` (C03) | same |
| Data dir | Volume or bind for `.data/` | Host path under `/opt/nusa.business/.data` |

## Operator verification (on the VPS)

```bash
cd /opt/nusa.business
git rev-parse HEAD
git status -sb
git log -1 --oneline

# Which supervisor owns the Node processes?
command -v pm2 >/dev/null && pm2 ls || true
docker compose -f docker/compose.prod.yml ps 2>/dev/null || true

# Health (adjust ports after the check above)
curl -sS http://127.0.0.1:4101/health || curl -sS http://127.0.0.1:8787/health
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4321/

bash scripts/vps-status.sh   # prefers Compose ports; interpret FAIL in context
```

Record: running commit SHA, supervisor (PM2 vs Compose), whether
`.data/store.json` is demo-seeded (C02), and CORS / API origin env (C03/C06).

## JSON store backup before any deploy

Atomic writes + `.bak` recovery landed in C07 (`packages/db` persist). Before
an authorized deploy:

```bash
# Example — paths must match the live data dir
sudo install -d -m 700 /var/backups/nusa
sudo cp -a /opt/nusa.business/.data/store.json \
  "/var/backups/nusa/store.json.$(date -u +%Y%m%dT%H%M%SZ)"
# Keep store.json.bak alongside if present
```

Restore is copy-back + process restart under the **same** supervisor that was
verified above. Do not mix Compose volume paths with PM2 host paths blindly.

## CI (repo)

GitHub Actions (`.github/workflows/ci.yml`) already gates every PR:

1. `npm install --ignore-scripts`
2. Build packages + api + portal + web
3. `npm test`
4. `npm run seed` smoke

Local analogue before asking for merge: `npm run build && npm test && npm run seed`.

## Local smoke (dev VM)

```bash
bash scripts/local-runtime-smoke.sh
```

Expects API `:8787`, web `:4321`, and optionally portal `:5173`.
