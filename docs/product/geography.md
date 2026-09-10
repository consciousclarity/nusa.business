# Geography & URL model

## Hierarchy

```text
nusa.business
 └── bali.nusa.business                         province (also an island)
      └── gianyar.bali.nusa.business            kabupaten host
           ├── /babi-guling-pande-egi
           └── /ubud/warung-babi-guling-ibu-oka
 └── jawa-timur.nusa.business                   province
      └── surabaya.jawa-timur.nusa.business
 └── java.nusa.business                         region hub → six Java provinces
```

| Layer | Example | Responsibility |
|---|---|---|
| Nation | `nusa.business` | 38 provinces grouped by island, search, claim CTA |
| Province | `bali.nusa.business`, `jawa-timur.nusa.business` | Kabupaten/kota index ([ADR-007](../architecture/adr/007-province-hosts.md)) |
| Region hub | `java.nusa.business` | Lists child provinces (not a province) |
| Admin place | `gianyar.bali.nusa.business` | Kabupaten/kota hub |
| Nested area | `gianyar.bali.nusa.business/ubud` | Tourist-area hub under its parent |
| Category browse | `…/c/warungs-local-food` | Indexable when it has results ([ADR-006](../architecture/adr/006-indexable-facet-urls.md)) |
| Allowlisted facet | `…/ubud/c/warungs-local-food/cuisine/balinese` | Single valuable pair; extra filters stay on the query string + noindex |
| Business | `…/ubud/{slug}` or `…/{slug}` | Profile, reviews, booking, shop tab |

See [ADR-004](../architecture/adr/004-admin-host-nested-path.md) and
[ADR-007](../architecture/adr/007-province-hosts.md). `parseHost` still stops
at `{place}.{province}` — nested areas are **path**. `lombok` aliases to
`nusa-tenggara-barat`. `{place}.java` 301s onto the owning province.

Seed geography: **38 provinces** and **514 kabupaten/kota**, plus tourist areas.

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
/host/{province}
/host/{kabupaten}.{province}
/host/{kabupaten}.{province}/{area}
/host/{kabupaten}.{province}/{area}/{business-slug}
/host/{kabupaten}.{province}/{business-slug}
```

Production uses real hosts; path mode is a dev/fallback convenience.
Legacy `/host/{area}.{island}/…` **301s** to the parent-host form.
