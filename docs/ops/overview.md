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

## Health

- API: `GET /health`  
- Web/portal: HTTP 200 on home routes  
- Compose: `docker compose -f docker/compose.yml ps`  
