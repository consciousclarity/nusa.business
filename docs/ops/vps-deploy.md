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
the deploy that needs care, and it is **not** solved in the Caddyfile.

A wildcard certificate covers **exactly one** label. No CA issues
`*.*.nusa.business` — not Let's Encrypt, not Cloudflare. So nested hosts cannot
be served from a wildcard anywhere in the chain.

`nusa.business` is **proxied** through Cloudflare (orange cloud), so there are
two independent certificates to think about.

### Edge (Cloudflare → visitor)

Universal SSL covers `nusa.business` and `*.nusa.business` only. Nested hosts
are **not** covered and will fail in the browser. Two ways out:

| Option | Cost | Notes |
|---|---|---|
| **Advanced Certificate Manager** | ~$10/mo | Add one wildcard *per island*: `*.bali.nusa.business`, `*.java.nusa.business`, … Up to 50 SANs per certificate, so ~48 islands fit. Must be extended when an island launches. |
| **Grey-cloud the nested records** | free | Set `*.bali` etc. to DNS-only. Those hosts bypass Cloudflare — no CDN, no DDoS shield — and Caddy issues real Let's Encrypt certificates for them. |

ACM is the better fit if the CDN matters; grey-clouding is fine while the
directory is small.

### Origin (Caddy → Cloudflare)

Because Cloudflare terminates TLS for visitors, the origin certificate only has
to satisfy Cloudflare. The site blocks use `tls internal` (Caddy's own CA):
ACME is unreliable behind an orange cloud — TLS-ALPN-01 can't reach the origin
at all, and HTTP-01 depends on the proxy.

> **Requires Cloudflare SSL/TLS mode = Full.** Under *Full (strict)* Cloudflare
> rejects a self-signed origin certificate. Either switch to Full, or install a
> free Cloudflare Origin CA certificate and point `tls` at it.

The other sites on this host keep their public Let's Encrypt certificates —
nothing here affects gustale.com, komputer.shop or n8n.

### The ask endpoint

For any host served with on-demand TLS, Caddy asks the API before issuing, so a
stranger pointing DNS at the origin can't trigger certificate generation:

```
GET http://127.0.0.1:4101/v1/tls-check?domain=gianyar.bali.nusa.business
→ 200  island and place exist       → Caddy issues
→ 404  unknown host                 → Caddy refuses
```

This matters most in the grey-cloud option, where issuance is real Let's
Encrypt and subject to a ~50 certificates/week limit per registered domain.

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
