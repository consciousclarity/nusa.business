# ADR-001: Greenfield OSS stack

- **Status:** Accepted  
- **Date:** 2026-08-07  

## Context

bali.business proves the product on WordPress. Nusa needs nested hosts (`place.island.nusa.business`), a shared national identity, and an open-source self-hosted stack. Next.js was rejected for public SEO/self-host friction; the existing theme stack is commercially licensed.

## Decision

Build:

- **Astro** — public directory  
- **React Router 7** — portals  
- **Hono** — API  
- **Postgres/PostGIS** (target) with JSON repository MVP  
- **Mercur/Medusa** — multi-vendor commerce (phased)  

No WordPress runtime in Nusa.

## Consequences

- Faster SEO pages and Docker-friendly deploys  
- Must reimplement the full capability set (tracked in features-parity.md)  
- Dual frontends (web + portal) to maintain  
