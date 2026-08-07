# Getting started

## Prerequisites

- Node.js **20+** (22 recommended)
- npm 10+
- Optional: Docker Desktop (PostGIS, Redis, Meilisearch, MinIO, Caddy)

## Install

```bash
git clone https://github.com/consciousclarity/nusa.business.git
cd nusa.business
npm install --ignore-scripts
cp .env.example .env
npm run seed
```

`--ignore-scripts` avoids sandbox/`allowScripts` friction on some environments; add lifecycle scripts later if packages require them.

## Run (three terminals)

```bash
npm run dev:api      # http://localhost:8787
npm run dev:web      # http://localhost:4321
npm run dev:portal   # http://localhost:5173
```

## Smoke checklist

| Check | URL |
|---|---|
| API health | http://localhost:8787/health |
| Nation | http://localhost:4321/ |
| Island | http://localhost:4321/host/bali |
| Place | http://localhost:4321/host/gianyar.bali |
| Listing | http://localhost:4321/host/gianyar.bali/babi-guling-pande-egi |
| Vendor shop tab | http://localhost:4321/host/gianyar.bali/celuk-silver-workshop |
| Portal | http://localhost:5173/login |

## Demo accounts

| Email | Password | Role |
|---|---|---|
| `admin@nusa.business` | `admin123` | admin |
| `agent@nusa.business` | `agent123` | field_agent |
| `owner@example.com` | `owner123` | owner |

## Optional Docker infra

```bash
npm run docker:up
```

See [ops/docker.md](./ops/docker.md). Apps still run on the host by default; Compose provides supporting services.

## Next reading

- [Product overview](./product/overview.md)
- [Architecture](./architecture/overview.md)
- [Contributing](../CONTRIBUTING.md)
