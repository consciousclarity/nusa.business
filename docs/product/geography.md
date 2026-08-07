# Geography & URL model

## Hierarchy

```text
nusa.business
 └── bali.nusa.business
      └── gianyar.bali.nusa.business
           └── /babi-guling-pande-egi
```

| Layer | Example | Responsibility |
|---|---|---|
| Nation | `nusa.business` | Island grid, global search entry, claim CTA |
| Island | `bali.nusa.business` | Island directory home |
| Place | `uluwatu.bali.nusa.business` | Local hub, filters, field-ops strip |
| Business | `…/slug` | Profile, reviews, booking, shop tab |

## Hybrid places

Places may be:

- **Administrative** — kabupaten / kota (e.g. Gianyar, Denpasar)  
- **Tourist areas** — Canggu, Uluwatu, Jimbaran (even when inside Badung)

Optional `parentPlaceId` links a tourist area to its kabupaten.

## Slugs

- Lowercase kebab-case, ASCII (`toSlug`)  
- Business slug unique **per place**  
- Island and place slugs unique within their parent  

## Local development paths

Without wildcard DNS, Astro serves:

```text
/host/{island}
/host/{place}.{island}
/host/{place}.{island}/{business-slug}
```

Production uses real hosts; path mode is a dev/fallback convenience.
