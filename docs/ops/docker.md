# Docker Compose

File: [`docker/compose.yml`](../../docker/compose.yml)

## Services

| Service | Port | Purpose |
|---|---|---|
| postgres (PostGIS) | 5432 | Future primary DB |
| redis | 6379 | Cache / jobs |
| meilisearch | 7700 | Search index |
| minio | 9000 / 9001 | Media |
| caddy | 8080→80 | Reverse proxy sketch |
| mercur | commented | Marketplace when enabled |

## Commands

```bash
npm run docker:up
npm run docker:down
```

Apps (`api`, `web`, `portal`) run on the host during development. Point `.env` at Compose services when integrating Postgres/Meilisearch/MinIO.
