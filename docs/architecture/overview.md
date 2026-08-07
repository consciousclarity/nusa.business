# Architecture overview

```text
                    ┌─────────────┐
                    │ Wildcard DNS│
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    Caddy    │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     Astro public    RR7 portal      Hono API (+ Mercur later)
           │               │               │
           └───────────────┴───────┬───────┘
                                   ▼
                    JSON store MVP → Postgres/PostGIS
                    (+ Redis, Meilisearch, MinIO)
```

## Design goals

1. **SEO-first public pages** (Astro, minimal JS)  
2. **Self-host friendly** (Docker + Caddy/Nginx, no Vercel lock-in)  
3. **Nested tenancy** that WordPress Multisite cannot express cleanly  
4. **Parity** with Listeo directory/booking and Dokan vendor commerce via OSS modules  

## Trust boundaries

- Public web is read-mostly; writes go through API with role checks  
- Portal holds demo session tokens today — replace with Better Auth + HTTP-only cookies on `.nusa.business`  
- Mercur (when enabled) is a separate commerce trust zone linked by vendor id  

## Related ADRs

- [001 Greenfield stack](./adr/001-greenfield-stack.md)  
- [002 Hybrid places](./adr/002-hybrid-places.md)  
- [003 Marketplace Mercur](./adr/003-marketplace-mercur.md)  
