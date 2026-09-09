# Geography & URL model

## Hierarchy

```text
nusa.business
 └── bali.nusa.business
      └── gianyar.bali.nusa.business          kabupaten host
           ├── /babi-guling-pande-egi         listing on Gianyar
           └── /ubud                          tourist-area hub
                └── /ubud/warung-babi-guling-ibu-oka
```

| Layer | Example | Responsibility |
|---|---|---|
| Nation | `nusa.business` | Island grid, global search entry, claim CTA |
| Island | `bali.nusa.business` | Island directory home |
| Admin place | `gianyar.bali.nusa.business` | Kabupaten/kota hub |
| Nested area | `gianyar.bali.nusa.business/ubud` | Tourist-area hub under its parent |
| Business | `…/ubud/{slug}` or `…/{slug}` | Profile, reviews, booking, shop tab |

See [ADR-004](../architecture/adr/004-admin-host-nested-path.md). `parseHost` still
stops at `{place}.{island}` — nested areas are **path**, not more DNS labels.

## Hybrid places

Places may be:

- **Administrative** — kabupaten / kota (e.g. Gianyar, Denpasar). These own the host.  
- **Tourist areas** — Canggu, Ubud, Uluwatu. Nested under a parent via `parentPlaceId`.

`geoNesting()` maps a place to `{ hostPlace, area? }`. Orphan tourist areas
(no admin parent) keep their own host until a parent is seeded.

## Slugs

- Lowercase kebab-case, ASCII (`toSlug`)  
- Business slug unique **per place**  
- Island and place slugs unique within their parent  
- At `/{seg}` on an admin host, a child area slug wins over a business slug  

## Local development paths

Without wildcard DNS, Astro serves:

```text
/host/{island}
/host/{kabupaten}.{island}
/host/{kabupaten}.{island}/{area}
/host/{kabupaten}.{island}/{area}/{business-slug}
/host/{kabupaten}.{island}/{business-slug}
```

Production uses real hosts; path mode is a dev/fallback convenience.
Legacy `/host/{area}.{island}/…` **301s** to the parent-host form.
