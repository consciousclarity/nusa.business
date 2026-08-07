# Cloudflare setup — nusa.business

This runbook onboards **nusa.business** to Cloudflare: zone/DNS, SSL for nested places, edge Worker, and data bindings (KV / D1 / R2).

## Current account status (automated)

| Resource | Status |
|---|---|
| Workers in account | None yet (edge Worker ready to deploy) |
| KV `nusa-cache` | Created — id `44f4df5e05bd4cc38646d82c25b69c31` |
| KV `nusa-sessions` | Created — id `6f8099a68709471fb41dcb9e2faa073e` |
| D1 `nusa` (APAC) | Created — id `3c833755-9e83-4bfd-951e-64864d2934b4` |
| R2 | **Blocked** — enable R2 once in the [R2 dashboard](https://dash.cloudflare.com/?to=/:account/r2) |
| Zone `nusa.business` | **Manual** — add domain in Cloudflare (API token for DNS not available via plugin) |

Code: [`apps/edge`](../../apps/edge) (`nusa-edge` Worker).

---

## Why nested SSL needs a plan

Universal SSL covers:

- `nusa.business`
- `*.nusa.business` → `bali.nusa.business` ✓  

It does **not** cover:

- `gianyar.bali.nusa.business` (`*.*.nusa.business`)

### Recommended certificate strategy

Order an **Advanced Certificate** (or enable Total TLS) including:

```text
nusa.business
*.nusa.business
*.bali.nusa.business
*.jawa.nusa.business
*.lombok.nusa.business
*.sumatera.nusa.business
*.sulawesi.nusa.business
*.kalimantan.nusa.business
*.maluku.nusa.business
*.papua.nusa.business
```

Each `*.{island}.nusa.business` covers place hubs under that island. ACM allows up to 50 SANs per cert (apex counts as one).

**Free alternative while prototyping:** keep public URLs as `bali.nusa.business` + path `/host/gianyar/...` until ACM is purchased.

---

## Step 1 — Add the zone

1. Open [Onboard a domain](https://dash.cloudflare.com/?to=/:account/domains/overview).
2. Enter `nusa.business`, choose Free (or Pro).
3. Cloudflare shows two nameservers — set them at your registrar.
4. Wait until the zone is **Active**.

Or with an API token (`Zone:Edit`, `DNS:Edit`):

```bash
# Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID first
npm run cf:zone --workspace=nusa.business
# or:
node scripts/cloudflare-setup-zone.mjs
```

---

## Step 2 — DNS records (after you have an origin or Worker)

### Option A — Edge Worker as origin (bootstrap)

Deploy `nusa-edge`, then in Workers → Domains add custom domains:

- `nusa.business`
- `www.nusa.business` (optional)
- later: `bali.nusa.business`, etc.

Or DNS:

| Type | Name | Content | Proxy |
|---|---|---|---|
| CNAME | `@` | `nusa-edge.<your-subdomain>.workers.dev` | DNS only often required for apex — prefer Custom Domains UI |
| CNAME | `*` | same Worker target | Proxied |

Prefer **Workers Custom Domains** over hand-rolled apex CNAMEs.

### Option B — VPS / Docker origin (current Astro+Hono)

| Type | Name | Content | Proxy |
|---|---|---|---|
| A / AAAA | `@` | your server IP | Proxied |
| A / AAAA | `*` | your server IP | Proxied |
| A / AAAA | `*.bali` | your server IP | Proxied (per island) |

Repeat `*.{island}` for each island you launch. SSL: ACM as above. Origin TLS: **Full (strict)** once the server has a valid cert (Caddy).

---

## Step 3 — Enable R2

1. [R2 overview](https://dash.cloudflare.com/?to=/:account/r2) → enable.
2. Create bucket `nusa-media`.
3. Uncomment the `r2_buckets` block in `apps/edge/wrangler.toml`.

---

## Step 4 — Deploy the edge Worker

```bash
cd apps/edge
npm install
npx wrangler login
npx wrangler deploy
curl https://nusa-edge.<account>.workers.dev/cf/health
```

Bind custom domains once the zone is Active.

---

## Step 5 — App wiring (next engineering)

| App | Cloudflare path |
|---|---|
| `apps/web` Astro | Switch to `@astrojs/cloudflare` adapter or keep Node origin behind CF proxy |
| `apps/api` Hono | Hono on Workers, or proxy `api.nusa.business` → Node |
| `apps/portal` | Static assets on Workers/Pages + API calls |
| Media | R2 + imgproxy / Cloudflare Images |
| Search | Keep Meilisearch on VPS, or later Vectorize |

Do not delete the Docker Compose path until Workers parity is proven.

---

## Checklist

- [ ] Zone `nusa.business` Active (nameservers updated)
- [ ] ACM / Total TLS covers island place wildcards
- [ ] `nusa-edge` deployed; `/cf/health` OK
- [ ] Custom domains attached
- [ ] R2 `nusa-media` enabled and bound
- [ ] SSL/TLS mode Full (strict) if using origin server
- [ ] Update [dns-and-routing.md](./dns-and-routing.md) with live nameserver names
