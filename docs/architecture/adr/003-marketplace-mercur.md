# ADR-003: Marketplace via Mercur (Medusa)

- **Status:** Accepted  
- **Date:** 2026-08-07  

## Context

Multi-vendor stores are conventionally a WordPress plugin concern. Nusa needs OSS commerce without rebuilding checkout/payouts from zero.

## Decision

1. Ship a **local vendor module** for multi-vendor UX (stores, products, 0% commission).  
2. Integrate **Mercur** (MIT, on Medusa) for production cart, split orders, payouts.  
3. Link `Business` ↔ Mercur vendor id one-to-one.  

Booking (service scheduling) stays in Nusa core, not Medusa, unless selling SKUs.

## Consequences

- Clear module boundary  
- Compose stub documents Mercur enablement  
- Until Mercur is live, checkout is not production-complete  
