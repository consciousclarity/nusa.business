# Tenancy & routing

## Production hosts

Parsed by `parseHost(hostHeader)`:

| Host | Context |
|---|---|
| `nusa.business` | nation |
| `bali.nusa.business` | island=`bali` |
| `gianyar.bali.nusa.business` | place=`gianyar`, island=`bali` |
| other | unknown |

Astro middleware rewrites island/place hosts to `/host/{label}/…` so the public
URL stays on the subdomain (`https://java.nusa.business/` not `…/host/java`).

## Dev path fallback

Astro `apps/web/src/pages/host/[label]/…`:

- label `bali` → island page  
- label `gianyar.bali` → place page  
- `…/babi-guling-pande-egi` → listing  

On the production apex, `/host/{label}` **301s** to the canonical nested host.

## Edge

Host Caddy (`deploy/caddy/nusa.business.caddy`) routes api / portal / nation +
islands / nested on-demand TLS. DNS: orange `*` for islands, grey `*.{island}`
for places — see [ops/dns-and-routing.md](../ops/dns-and-routing.md).
