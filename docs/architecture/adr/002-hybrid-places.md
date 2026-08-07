# ADR-002: Hybrid place taxonomy

- **Status:** Accepted  
- **Date:** 2026-08-07  

## Context

User examples mix tourist areas (Uluwatu, Jimbaran, Canggu) and kabupaten (Gianyar). Strict administrative-only hubs hurt SEO and visitor mental models; tourist-only hubs break local government/ops mapping.

## Decision

Places are hybrid: `kabupaten` | `kota` | `tourist_area`, with optional `parentPlaceId` for area → kabupaten.

## Consequences

- Richer seed and routing  
- Need canonicalization/redirect rules when aliases collide  
- Field ops pick the place visitors actually search for  
