# Hostinger VPS deploy — nusa.business → 62.72.7.218

## Architecture

```text
Internet → Cloudflare (DNS + proxy + edge SSL)
        → VPS 62.72.7.218 :80/:443 (Caddy)
           ├─ nusa.business / *.nusa.business / *.*.nusa.business → Astro web
           ├─ api.nusa.business → Hono API
           └─ portal.nusa.business → static portal
```

## Prerequisites

1. Cloudflare DNS A records (proxied) for `@`, `www`, `*`, `*.bali`, … → `62.72.7.218`
2. Cloudflare SSL/TLS mode **Full**
3. VPS: Ubuntu, Docker Engine + Compose plugin, ports 80/443 open
4. SSH access as a sudo user

## One-time server setup

```bash
ssh root@62.72.7.218   # or your sudo user
curl -fsSL https://get.docker.com | sh
git clone https://github.com/consciousclarity/nusa.business.git /opt/nusa.business
cd /opt/nusa.business
bash scripts/deploy-vps.sh
```

## Update deploy

```bash
cd /opt/nusa.business
git pull
bash scripts/deploy-vps.sh
```

## Verify

```bash
curl -sI http://127.0.0.1/          # via Caddy :80
curl -s https://api.nusa.business/health
curl -sI https://nusa.business/
curl -sI https://portal.nusa.business/
```

## Files

| File | Role |
|---|---|
| `docker/compose.prod.yml` | api + web + portal + caddy |
| `docker/Caddyfile.prod` | Host routing / TLS internal (CF Full) |
| `scripts/deploy-vps.sh` | Build & up |

## Hostinger MCP

If you connect the [Hostinger Cursor plugin](https://github.com/hostinger/hostinger-cursor-plugin), the agent can check VPS power/firewall from chat. DNS for `nusa.business` stays in **Cloudflare**, not Hostinger DNS.
