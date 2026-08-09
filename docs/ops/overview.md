# Ops overview

## Goals

- Self-host on VPS/Docker  
- Wildcard TLS for nested subdomains  
- Separate public / portal / API hostnames as needed  

## Runbooks

- [DNS & routing](./dns-and-routing.md)  
- [Docker Compose](./docker.md)  
- [Environments](./environments.md)  
- [Security](./security.md)  
- [Code review & approval policy](./code-review.md)  

## Cloudflare

See [cloudflare.md](./cloudflare.md) for zone onboarding, nested SSL (ACM), edge Worker, KV/D1/R2.

Quick links:

- Edge Worker: `apps/edge`
- Zone script: `npm run cf:zone` (needs `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`)
- Deploy edge: `npm run cf:deploy-edge` (needs `wrangler login`)
