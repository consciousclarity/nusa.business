---
name: nusa-ideas
description: >-
  Capture product and platform brainstorms into docs/ideas so chat is not the
  only memory. Use when the user brainstorms, explores ideas, asks “what if”,
  discusses future features, fraud/trust/monetization options, or says to save
  / file / remember an idea.
---

# Nusa ideas inbox

## Why

Solo founder + Cursor chats. Conversation history is **not** the project.
Durable brainstorms live in `docs/ideas/`.

## When to act (do this without being asked)

If the user is brainstorming, exploring options, or dumping product thoughts — **write or update a note before the turn ends**. Do not wait for “please save this.”

Also act when they say things like: save this, file this, remember this, don’t lose this, put it in the repo.

## When not to create a new idea note

- Pure bugfix / implementation of an already-specified feature
- Trivial one-line clarifications with no lasting product thought
- Content that already belongs only in an ADR or parity update (update those instead)

## Workflow

1. **Search** `docs/ideas/` for an existing note on the same topic (by filename + index). Prefer updating over duplicating.
2. **Create** from `docs/ideas/_template.md` if none exists:
   - Path: `docs/ideas/YYYY-MM-DD-short-kebab-topic.md` (today’s date UTC/local as given in session)
   - Status starts at `seed` or `exploring`
3. **Write lightly**: problem itch, bullet notes from chat, options + open questions, one next step. Messy bullets > polished essay.
4. **Update** `docs/ideas/README.md` index row (title link, status, updated date).
5. **Promote** when decided:
   - Architecture / product rule → new or updated ADR under `docs/architecture/adr/`
   - Scheduled capability → `docs/product/roadmap.md` and/or `docs/features-parity.md`
   - Security hardening → `docs/ops/security.md`
   - Set idea status to `decided` or `done` and link the promoted doc

## Status meanings

| Status | Use when |
|---|---|
| `seed` | Mentioned; barely shaped |
| `exploring` | Active options discussion |
| `parked` | Explicitly deferred |
| `decided` | Direction chosen; promote soon |
| `done` | Living elsewhere; keep note for history |

## Commit habit

Idea notes are real project docs. Commit them with the brainstorm session (or the PR that captures them). Do not leave valuable chat-only conclusions unfiled.

## Tone with the user

Be brief. After filing, one line is enough: which file you wrote/updated and its status. Offer the next brainstorm step only if they were mid-topic.
