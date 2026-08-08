# DNS & routing

## Required records (production)

Assuming DNS at Cloudflare:

| Type | Name | Content | Proxy | Covers |
|---|---|---|---|---|
| A | `@` | `62.72.7.218` | Proxied | `nusa.business` |
| A | `www` | `62.72.7.218` | Proxied | `www.nusa.business` → redirect apex |
| A | `*` | `62.72.7.218` | Proxied | `java.nusa.business`, `api…`, `portal…` |
| A | `*.java` | `62.72.7.218` | **DNS-only** | `yogyakarta.java.nusa.business`, … |
| A | `*.bali` | `62.72.7.218` | **DNS-only** | `gianyar.bali.nusa.business`, … |
| … | `*.{island}` | same IP | **DNS-only** | every place under that island |

You do **not** create one DNS record per place. One `*.{island}` wildcard covers all places.

Nested place hosts are **grey-clouded** so Caddy can issue real Let's Encrypt certificates (Free Universal SSL only covers one wildcard label). Island hosts stay orange under `*`.

Upsert with:

```bash
export CLOUDFLARE_API_TOKEN="..."
export CLOUDFLARE_ACCOUNT_ID="..."
export ORIGIN_IPV4="62.72.7.218"
npm run cf:zone
```

## Application routing

| Host pattern | App |
|---|---|
| `nusa.business` | Astro nation hub |
| `{island}.nusa.business` | Astro island hub (`parseHost`) |
| `{place}.{island}.nusa.business` | Astro place hub |
| `{place}.{island}.nusa.business/{slug}` | listing |
| `portal.nusa.business` | Portal |
| `api.nusa.business` | Hono API |

`/host/{label}` on the apex **301s** to the canonical nested host in production. Localhost keeps `/host/...` as the primary surface.

Cookie domain for future auth: `.nusa.business`.

## Local

Use `/host/...` paths on port 4321, or map `bali.localhost` etc. via OS hosts + Caddy (`docker/Caddyfile`).
