# Tenancy & routing

## Production hosts

Parsed by `parseHost(hostHeader)`:

| Host | Context |
|---|---|
| `nusa.business` | nation |
| `bali.nusa.business` | island=`bali` |
| `gianyar.bali.nusa.business` | place=`gianyar`, island=`bali` |
| `gianyar.bali.nusa.business/ubud` | same host; path is nested tourist area |
| other | unknown |

Astro middleware rewrites island/place hosts to `/host/{label}/…` so the public
URL stays on the subdomain (`https://gianyar.bali.nusa.business/ubud/…` not
`…/host/gianyar.bali/ubud/…`).

Tourist-area hosts such as `ubud.bali.nusa.business` still parse, then **301**
to the administrative parent (`gianyar.bali.nusa.business/ubud`). See
[ADR-004](./adr/004-admin-host-nested-path.md).

## Dev path fallback

Astro `apps/web/src/pages/host/[label]/…`:

- label `bali` → island page  
- label `gianyar.bali` → kabupaten/kota hub  
- `…/ubud` → nested tourist-area hub  
- `…/c/{category}` and `…/c/{category}/{facet}/{value}` → category browse (see [ADR-006](./adr/006-indexable-facet-urls.md))  
- `…/ubud/c/{category}` → the same under a nested area  
- `…/ubud/warung-babi-guling-ibu-oka` → listing  
- `…/babi-guling-pande-egi` → listing on the kabupaten itself  

On the production apex, `/host/{label}` **301s** to the canonical nested host.

## Edge

Host Caddy (`deploy/caddy/nusa.business.caddy`) routes api / portal / nation +
islands / nested on-demand TLS. DNS: orange `*` for islands, grey `*.{island}`
for places — see [ops/dns-and-routing.md](../ops/dns-and-routing.md).
