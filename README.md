# Nusa.Business

Indonesia’s nested local-business directory — greenfield open-source platform inspired by [bali.business](https://bali.business).

```text
nusa.business → bali.nusa.business → gianyar.bali.nusa.business → /babi-guling-pande-egi
```

Listeo + Dokan **capability** parity without WordPress. Stack: **Astro** (public) · **React Router 7** (portal) · **Hono** (API).

## Documentation

**Start here → [docs/README.md](docs/README.md)**

| | |
|---|---|
| Getting started | [docs/getting-started.md](docs/getting-started.md) |
| Architecture | [docs/architecture/overview.md](docs/architecture/overview.md) |
| API | [docs/api/overview.md](docs/api/overview.md) |
| Feature parity | [docs/features-parity.md](docs/features-parity.md) |
| Agents / Cursor | [AGENTS.md](AGENTS.md) · [docs/agents/skills.md](docs/agents/skills.md) |
| Contributing | [CONTRIBUTING.md](CONTRIBUTING.md) |

## Quick start

```bash
npm install --ignore-scripts
cp .env.example .env
npm run seed
npm run dev:api      # :8787
npm run dev:web      # :4321
npm run dev:portal   # :5173
```

Dev tenants (no wildcard DNS):  
http://localhost:4321/host/gianyar.bali/babi-guling-pande-egi

Demo logins: `owner@example.com` / `owner123` · `agent@nusa.business` / `agent123` · `admin@nusa.business` / `admin123`

## License

[MIT](LICENSE)
