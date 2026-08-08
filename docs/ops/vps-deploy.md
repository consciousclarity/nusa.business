# Hostinger VPS deploy — nusa.business → 62.72.7.218

## Architecture

The VPS is **shared**. A single systemd Caddy owns `:80`/`:443` for every site
on the box (gustale.com, gustale.recipes, komputer.shop, n8n). Nusa does not
run its own edge proxy — it publishes to loopback and the host Caddy routes to
it.

```text
Internet → Cloudflare DNS → VPS 62.72.7.218
                             └─ systemd Caddy :80/:443  (shared, host-level)
                                ├─ nusa.business, *.nusa.business  → 127.0.0.1:4321  web (Astro)
                                ├─ *.*.nusa.business (on-demand TLS) → 127.0.0.1:4321
                                ├─ api.nusa.business               → 127.0.0.1:4101  api (Hono)
                                └─ portal.nusa.business            → 127.0.0.1:4103  portal
```

Other containers already on this host use the same pattern (`komputer-shop-web`
on `127.0.0.1:8090`, `shared-postgres` on `127.0.0.1:5432`).

> Do **not** add a Caddy/nginx container to `compose.prod.yml`. It will fail to
> bind — the host Caddy already holds those ports. `scripts/deploy-vps.sh`
> guards against this.

## Nested subdomains and TLS

The directory is nested: `gianyar.bali.nusa.business`. This is the one part of
the deploy that needs care.

A wildcard certificate covers **exactly one** label, and no CA — Let's Encrypt
included — issues `*.*.nusa.business`. So nested hosts cannot be served from a
wildcard at all.

Instead Caddy uses **on-demand TLS**: it issues a certificate per concrete
hostname the first time that host is requested. To stop a stranger pointing DNS
at the origin and burning the issuance quota, Caddy asks the API first:

```
GET http://127.0.0.1:4101/v1/tls-check?domain=gianyar.bali.nusa.business
→ 200  island and place exist       → Caddy issues
→ 404  unknown host                 → Caddy refuses
```

Let's Encrypt allows ~50 certificates per week per registered domain. That is
comfortable at launch. If the directory grows to hundreds of live place
subdomains, move to Cloudflare Advanced Certificate Manager (which does support
two-level wildcards) and switch the origin to `tls internal`.

### Cloudflare mode

| Mode | Works with nested hosts? |
|---|---|
| DNS-only (grey cloud) | Yes — Caddy gets real certs via on-demand TLS. **Recommended at launch.** |
| Proxied (orange) + Universal SSL | No — same one-level wildcard limit at the edge |
| Proxied + Advanced Certificate Manager | Yes — then origin can use `tls internal` |

## Prerequisites

1. Cloudflare DNS A records → `62.72.7.218` for `@`, `www`, `*`, `api`,
   `portal`, and each `*.{island}` in use
2. Docker Engine + Compose plugin (already installed on this host)
3. Host Caddy running (already the case — shared with gustale.com)

## One-time setup

```bash
ssh root@62.72.7.218
git clone https://github.com/consciousclarity/nusa.business.git /opt/nusa.business
cd /opt/nusa.business

cp .env.example .env
echo "NUSA_AUTH_SECRET=$(openssl rand -hex 32)" >> .env   # required

bash scripts/deploy-vps.sh
```

Then wire the host Caddy — merge `deploy/caddy/nusa.business.caddy` into
`/etc/caddy/Caddyfile`, **replacing** the existing placeholder stanza:

```caddyfile
nusa.business, www.nusa.business, *.nusa.business {
    reverse_proxy 127.0.0.1:4321
}
```

The `on_demand_tls` directive goes in the existing global `{ }` block at the
top of the file — do not add a second one. Then:

```bash
cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak.$(date +%Y%m%d-%H%M%S)
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy    # reload, not restart — keeps the other sites up
```

## Update deploy

```bash
cd /opt/nusa.business
git pull
bash scripts/deploy-vps.sh
```

## Verify

```bash
bash scripts/vps-status.sh
```

Checks containers, loopback upstreams, the TLS ask endpoint, Caddy validity,
and the public URLs. Exits non-zero on any failure.

## Files

| File | Role |
|---|---|
| `docker/compose.prod.yml` | api + web + portal, loopback-only ports |
| `deploy/caddy/nusa.business.caddy` | Site blocks for the **host** Caddy |
| `scripts/deploy-vps.sh` | Build, start, health-gate |
| `scripts/vps-status.sh` | Read-only health check |

## Ports on this host

Taken: `4000`, `4001`, `4002` (gustale), `5000` (libretranslate), `5678` (n8n),
`8090` (komputer.shop), `9000-9001` (minio), `5432` (postgres), `6333-6334`
(qdrant), `11434` (ollama), `20128`, `9377`.

Nusa uses `4101` (api), `4103` (portal), `4321` (web).

## Environment

| Variable | Required | Notes |
|---|---|---|
| `NUSA_AUTH_SECRET` | **yes in production** | ≥16 chars; signs bearer tokens. API refuses to start without it when `NODE_ENV=production` |
| `NUSA_TOKEN_TTL` | no | Token lifetime in seconds, default 604800 |
| `NUSA_DATA_DIR` | no | Container sets `/data`, backed by the `api_data` volume |

Rotating `NUSA_AUTH_SECRET` invalidates every issued token, forcing all portal
users to log in again.

## Notes on the shared host

- `shared-postgres` is **postgis/postgis:16-3.4** on `127.0.0.1:5432` — the
  natural target when the JSON store in `packages/db` moves to Postgres.
- `shared-minio` on `127.0.0.1:9000` is available for listing images.
- Unrelated to Nusa: `dify-nginx-1`, `dify-plugin_daemon-1` and
  `dify-ssrf_proxy-1` crash-loop on a bad bind mount
  (`cp: -r not specified; omitting directory '/docker-entrypoint-mount.sh'`).
