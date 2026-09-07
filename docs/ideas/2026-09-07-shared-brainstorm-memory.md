# Shared brainstorm memory (multi-tool)

| Field | Value |
|---|---|
| Status | `decided` |
| Captured | 2026-09-07 |
| Updated | 2026-09-07 |
| Related | [ideas inbox](./README.md) |

## Problem / itch

Owner works in **Cursor**, **Claude Code on GitHub**, and **ChatGPT**. Separate chats do not share memory. Ideas must live in the **git repo** so every tool reads the same truth.

## Notes from chat

- 2026-09-07: confirmed multi-tool workflow; asked whether docs are on GitHub; clarified draft PR vs `main`.
- Practice: brainstorm anywhere → agent/human writes `docs/ideas/…` → push branch → merge to `main` when ready → all tools pull `main`.

## Decision

1. Durable product thoughts go under `docs/ideas/` (this inbox).
2. Decided architecture → ADR; scheduled work → roadmap / parity; security → `docs/ops/security.md`.
3. Chat transcripts are disposable; **merged docs on `main` are canonical**.

## Next step

Merge the ideas-inbox PR when comfortable so Claude Code / ChatGPT / future Cursor sessions see these notes on `main` without the feature branch.
