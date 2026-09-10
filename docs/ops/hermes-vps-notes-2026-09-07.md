# Hermes VPS reconnaissance notes (read-only)

Captured 2026-09-07 from Hermes operator report. **No production changes
performed from this note.** Paths and process managers only — no secrets.

**Superseded 2026-09-09:** an authorized deploy confirmed **Compose** (not PM2)
on loopback `4101` / `4321` / `4103`. See [release-decision.md](./release-decision.md).
Leave the 2026-09-07 table below as historical.

**Warden** is the Hermes agent that runs **on this VPS**. Coordinate backfill
and other on-box store edits go to Warden — see
[backfill-listing-coords.md](./backfill-listing-coords.md). Cursor agents must
not deploy or mutate production without explicit authorization.

## Observed topology

| Item | Hermes report |
|---|---|
| Host | Hostinger VPS (see existing ops docs; do not paste credentials into git) |
| App path | `/opt/nusa.business` |
| Process manager | **PM2** for `web`, `api`, `portal` (also unrelated `n8n`, `celery`) |
| External ports | App processes not exposed publicly; host reverse proxy / Docker only for shared postgres/minio |
| Last deploy signal | `deploy/caddy/` activity around **2026-08-09** (stale vs Sep 2026 repo) |

## Conflict with repo docs

`docs/ops/vps-deploy.md` + `docker/compose.prod.yml` describe a Compose stack
publishing api/web/portal on loopback (`4101` / `4321` / `4103`) behind host
Caddy. Hermes currently sees **PM2**, not that Compose app stack.

Implications for remaining checklist items:

- **C03** config still applies under either model: browser →
  `https://api.nusa.business`; SSR → loopback or Compose DNS via
  `NUSA_SSR_API_URL` (e.g. `http://127.0.0.1:4101` or `http://127.0.0.1:8787`
  depending on how PM2 binds).
- **C07 / C13** must verify which process actually serves production before
  backup/restore or rollback runbooks are marked PASS.
- Do not assume the VPS commit matches `main` until an authorized operator
  confirms `git rev-parse HEAD` under `/opt/nusa.business`.

## Operator follow-ups (authorized only)

1. Confirm whether Compose or PM2 is the intended long-term runtime; update
   `docs/ops/vps-deploy.md` accordingly.
2. Record the running commit SHA and whether `.data/store.json` (or volume)
   contains demo seed users (C02 cleanup procedure).
3. After merging launch-readiness follow-ups, plan a controlled deploy with
   backup + rollback — Cursor must not deploy without explicit authorization.
   Operator checklist: [launch-readiness.md](./launch-readiness.md).
