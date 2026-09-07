# Ideas inbox

Solo-founder scratchpad for product and platform brainstorms. Chat is ephemeral; **this folder is the durable memory**.

You work across **Cursor, Claude Code, and ChatGPT** — they do not share chat history. Anything worth keeping must be filed here (and merged to `main`) so every tool sees the same notes.

You do not need to remember to file things. When you brainstorm with Cursor (“how do we prevent fraud?”, “should packages be…?”), the agent should write or update a note here and refresh this index.

## How it works

1. Talk in chat — messy is fine.
2. Agent captures a note under `docs/ideas/` (or updates an existing one).
3. You skim the index when you want to pick something up later.
4. When an idea is ready to ship as a decision, **promote** it:
   - Architecture / product rule → [ADR](../architecture/adr/README.md)
   - Scheduled work → [roadmap](../product/roadmap.md) + [features-parity](../features-parity.md)
   - Security hardening → [ops/security](../ops/security.md)

## Statuses

| Status | Meaning |
|---|---|
| `seed` | Mentioned once; barely shaped |
| `exploring` | Active brainstorm; options still open |
| `parked` | Intentionally deferred; keep the notes |
| `decided` | Direction chosen; promote to ADR / roadmap / security doc |
| `done` | Captured elsewhere; note kept for history |

## Index

| Idea | Status | Updated |
|---|---|---|
| [Shared brainstorm memory (multi-tool)](./2026-09-07-shared-brainstorm-memory.md) | `decided` | 2026-09-07 |
| [Complete listing profile](./2026-09-07-complete-listing-profile.md) | `exploring` | 2026-09-07 |
| [Listing verification & badge](./2026-09-07-listing-verification.md) | `exploring` | 2026-09-07 |
| [Indonesia-first category taxonomy](./2026-09-07-indonesia-category-taxonomy.md) | `exploring` | 2026-09-07 |
| [Fast text directory + vendor–visitor contact](./2026-09-07-fast-text-and-contact.md) | `exploring` | 2026-09-07 |
| [Prevent platform fraud](./2026-09-07-prevent-platform-fraud.md) | `seed` | 2026-09-07 |

## Naming

`YYYY-MM-DD-short-kebab-topic.md` — date is when the idea was first captured.

Copy [`_template.md`](./_template.md) for new notes (agents do this for you).
