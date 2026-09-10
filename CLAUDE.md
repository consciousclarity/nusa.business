@AGENTS.md

## Claude Code specifics

`AGENTS.md` above is the project guide and is the source of truth. This section
covers only what differs when the agent is Claude Code.

### Where the guardrails live

| Path | Loaded when |
|---|---|
| `.claude/rules/nusa-core.md` | every session |
| `.claude/rules/nusa-web-astro.md` | reading `apps/web/**` |
| `.claude/rules/nusa-portal.md` | reading `apps/portal/**` |
| `.claude/rules/nusa-api-data.md` | reading `apps/api/**`, `packages/db/**`, `packages/shared/**` |
| `.claude/skills/*/SKILL.md` | on demand, by task |

`.cursor/rules/` and `.cursor/skills/` are the Cursor equivalents. Claude Code
does not read them. **The skills are currently duplicated in both trees** — edit
both, or delete `.cursor/` once the migration is settled.

### Two files that fail CI if you are careless

- **`apps/web/src/styles/global.css`** — `tests/web.perf-budget.test.mjs` caps it
  at 14,000 bytes source and 4,000 gzipped. Headroom is small; check it before
  adding rules. The same test rejects any `client:*` directive under
  `apps/web/src/pages/`.
- **`apps/web/src/pages/index.astro`** — `tests/web.visitor-chrome.test.mjs`
  reads it as **source text** and pins exact strings, including the map-callback
  variable name `island`. Renaming that variable breaks the suite.

Use plan mode for changes to either, and for `packages/shared/src/index.ts`.

### Running on the VPS

If this session is on `62.72.7.218`, it is a **shared production host** also
serving gustale.com, gustale.recipes, komputer.shop and n8n.

- **Never edit `/opt/nusa.business`** — that is the deploy checkout;
  `scripts/deploy-vps.sh` runs `git checkout` in it. Develop in a separate clone.
- **Never deploy without explicit owner authorization** for the specific SHA —
  see `docs/ops/release-decision.md`. A push to `main` is not a deploy, and
  `tests/ci.workflow.test.mjs` enforces that CI never deploys.
- Back up the store before any deploy. The live data — the businesses and the
  admin user — lives in the Compose volume `docker_api_data`, not in a host
  directory.

### Rebuild packages after editing them

`@nusa/shared` and `@nusa/db` compile to `dist/`, and both the apps and the tests
import the built output. After touching `packages/*`, run `npm run build:packages`
or you are testing stale code.
