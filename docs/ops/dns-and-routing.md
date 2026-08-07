# DNS & routing

## Required records (production)

Assuming DNS at Cloudflare (or equivalent):

1. Apex `nusa.business` → load balancer / Caddy  
2. Wildcard `*.nusa.business` → same  
3. Multi-level wildcard `*.*.nusa.business` → same (provider support required)

If the DNS host cannot do multi-level wildcards, use Caddy **on-demand TLS** with a single catch-all A/AAAA to the VPS and application-level host parsing (already supported).

## Application routing

| Host pattern | App |
|---|---|
| `nusa.business`, `*.nusa.business`, `*.*.nusa.business` | Astro public (tenant from `Host`) |
| `portal.nusa.business` (optional) | Portal |
| `api.nusa.business` (optional) | Hono API |

Cookie domain for future auth: `.nusa.business`.

## Local

Use `/host/...` paths on port 4321, or map `bali.localhost` etc. via OS hosts + Caddy (`docker/Caddyfile`).
