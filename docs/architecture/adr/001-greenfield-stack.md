# ADR-001: Greenfield OSS stack

- **Status:** Accepted  
- **Date:** 2026-08-07  

## Context

bali.business proves the product on Listeo + WordPress (+ Dokan for marketplace). Nusa needs nested hosts (`place.island.nusa.business`), a shared national identity, and an open-source self-hosted stack. Next.js was rejected for public SEO/self-host friction; Listeo is proprietary.

## Decision

Build:

- **Astro** — public directory  
- **React Router 7** — portals  
- **Hono** — API  
- **Postgres/PostGIS** (target) with JSON repository MVP  
- **Mercur/Medusa** — Dokan-parity commerce (phased)  

No WordPress runtime in Nusa.

## Consequences

- Faster SEO pages and Docker-friendly deploys  
- Must reimplement Listeo/Dokan features (tracked in features-parity.md)  
- Dual frontends (web + portal) to maintain  
