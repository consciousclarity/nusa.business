# Tenancy & routing

## Production hosts

Parsed by `parseHost(hostHeader)`:

| Host | Context |
|---|---|
| `nusa.business` | nation |
| `bali.nusa.business` | island=`bali` |
| `gianyar.bali.nusa.business` | place=`gianyar`, island=`bali` |
| other | unknown |

## Dev path fallback

Astro `apps/web/src/pages/host/[label]/…`:

- label `bali` → island page  
- label `gianyar.bali` → place page  
- `…/babi-guling-pande-egi` → listing  

Nation `index.astro` redirects real subdomain requests into `/host/...` when developing against hosts that point at the Astro process.

## Edge

Caddyfile sketch in `docker/Caddyfile` routes `api.*` / `portal.*` / default to host ports. Production must terminate TLS for `*.nusa.business` and `*.*.nusa.business`.

See [ops/dns-and-routing.md](../ops/dns-and-routing.md).
