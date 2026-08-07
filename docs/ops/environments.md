# Environments

| Env | API data | Public URL | Notes |
|---|---|---|---|
| Local | `.data/store.json` | localhost ports | Seeded demo |
| Staging | Postgres | staging hosts | Mirror prod DNS shape |
| Production | Postgres + replicas | `*.nusa.business` | TLS wildcards |

Configure via `.env` (see `.env.example`). Never commit secrets.

## Promotion checklist

- [ ] Migrations applied  
- [ ] Seed/migration import verified  
- [ ] Meilisearch reindex  
- [ ] Cookie domain set  
- [ ] 301 map from bali.business tested on staging  
