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
| Zone `nusa.business` | **Added by you** — DNS origin = Hostinger (see below) |

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
*.java.nusa.business
*.lombok.nusa.business
*.sumatra.nusa.business
*.sulawesi.nusa.business
*.kalimantan.nusa.business
*.maluku.nusa.business
*.papua.nusa.business
```

Each `*.{island}.nusa.business` covers place hubs under that island. ACM allows up to 50 SANs per cert (apex counts as one).

**Free alternative while prototyping:** keep public URLs as `bali.nusa.business` + path `/host/gianyar/...` until ACM is purchased.

---

## Hostinger + Cloudflare (your current setup)

**Cloudflare** = DNS + CDN/proxy + SSL edge.  
**Hostinger** = origin server (where the site files / VPS live).

Do **not** keep Hostinger nameservers if the zone is on Cloudflare. Registrar (often Hostinger Domains) must use **Cloudflare nameservers** only.

### 1. Confirm zone is Active

Cloudflare → **nusa.business** → Overview → status **Active**.  
If still Pending, copy the 2 Cloudflare nameservers into Hostinger → Domains → `nusa.business` → Nameservers → change from Hostinger NS to Cloudflare NS.

### 2. Get Hostinger origin IP

**Current Nusa VPS (Hostinger):** `62.72.7.218`

(Confirm anytime in hPanel → VPS → IP address if it changes.)

### 3. DNS records in Cloudflare (not in Hostinger DNS)

Cloudflare → **DNS** → **Records**. Delete conflicting Hostinger parking records if Cloudflare imported junk.

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | `62.72.7.218` | Proxied (orange cloud) |
| A | `www` | `62.72.7.218` | Proxied |
| A | `*` | `62.72.7.218` | Proxied |
| A | `*.bali` | `62.72.7.218` | **DNS-only (grey)** |
| A | `*.java` | `62.72.7.218` | **DNS-only (grey)** |
| A | `*.lombok` | `62.72.7.218` | **DNS-only (grey)** |
| A | `*.sumatra` | `62.72.7.218` | **DNS-only (grey)** |
| A | `*.sulawesi` | `62.72.7.218` | **DNS-only (grey)** |
| A | `*.kalimantan` | `62.72.7.218` | **DNS-only (grey)** |
| A | `*.maluku` | `62.72.7.218` | **DNS-only (grey)** |
| A | `*.papua` | `62.72.7.218` | **DNS-only (grey)** |

- `@` + `*` → `nusa.business` and `bali.nusa.business` (island hosts, orange)  
- `*.bali` → `gianyar.bali.nusa.business`, … (place hosts, **grey** so origin can mint LE certs)

Or with API token:

```bash
export CLOUDFLARE_API_TOKEN="..."
export CLOUDFLARE_ACCOUNT_ID="..."
export ORIGIN_IPV4="62.72.7.218"
npm run cf:zone
```

Mail: keep MX/TXT **DNS only** (grey cloud) if you use Hostinger email.

### 4. SSL/TLS in Cloudflare

**SSL/TLS** → Overview → **Full** or **Full (strict)** once apex/api/portal have Let's Encrypt at the origin.

Place-level HTTPS (`*.bali.nusa.business`) uses **grey-cloud DNS + Caddy on-demand LE** (gated by `/v1/tls-check`). Free Universal SSL does not cover two-label hosts when orange-clouded. ACM (~$10/mo) is the alternative if you want nested hosts behind the CDN later.

After renaming an island slug in seed/migrations (`jawa` → `java`, `sumatera` → `sumatra`), re-run `npm run cf:zone`. Otherwise place hosts under the new slug fall through to the orange `*` record and HTTPS handshake-fails (the failure mode behind https://jakarta.java.nusa.business/ before `*.java` was upserted). The zone script also deletes obsolete `*.jawa` / `*.sumatera` wildcards.

### 5. Hostinger VPS

On `62.72.7.218`:

- Open **80/443** (and SSH) in the Hostinger firewall / UFW  
- Run the Nusa stack (Docker Compose or Node processes) behind **Caddy/Nginx**  
- Origin should answer for `nusa.business` and nested hosts (or a default vhost that accepts all `*.nusa.business`)  
- Prefer Caddy on-demand TLS **or** Cloudflare Full + origin cert later  

### 6. Skip Wrangler for now (optional)

`wrangler login` / `cf:deploy-edge` is only if you want the Cloudflare Worker front door. With this VPS as origin, DNS A → `62.72.7.218` is enough to go live; the edge Worker can come later.

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
