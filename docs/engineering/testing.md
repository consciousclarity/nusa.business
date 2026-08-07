# Testing

## Current state

No automated test suite yet. CI builds packages and apps on PR.

## Minimum manual QA

See [getting-started smoke checklist](../getting-started.md#smoke-checklist) plus persona journeys in [personas.md](../product/personas.md).

## Target pyramid

1. **Unit** — `parseHost`, `toSlug`, repository helpers  
2. **API integration** — Hono routes against temp store  
3. **Smoke e2e** — Playwright on `/host/...` + portal claim  

Add tests beside packages (`*.test.ts`) when introducing CI test job.
