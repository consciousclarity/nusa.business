# Complete listing profile (contacts & channels)

| Field | Value |
|---|---|
| Status | `exploring` |
| Captured | 2026-09-07 |
| Updated | 2026-09-07 |
| Related | [verification process](./2026-09-07-listing-verification.md), [fast text + contact](./2026-09-07-fast-text-and-contact.md), `Business` in `packages/db` (`website`, `whatsapp`, `social?`) |

## Problem / itch

A listing should answer **everything a visitor would ask** before going or messaging: how to book, social proof channels, maps, hours, address, phone/WA. Incomplete profiles hurt trust and conversion.

Owner (2026-09-07): add weblinks for booking, Instagram, Facebook, etc. Directory must surface all available info; completeness + currency matter as much as presence.

## Notes from chat

- Today public record shows: categories, address, phone, WhatsApp, booking *mode*, status, hours, reviews, optional vendor shop.
- Types already allow `website`, `whatsapp`, and `social?: Record<string, string>` — not fully productized on public/portal UX.
- Speed / no-images stance still applies: links and text stamps, not heavy embeds or gallery-first chrome.
- Shared across Cursor / Claude Code / ChatGPT → decisions live in git, not chat silos.

## Proposed field set (draft)

| Field | Purpose |
|---|---|
| `phone` | Voice / SMS |
| `whatsapp` | Primary Indonesia contact (CTA → `wa.me`) |
| `email` | Optional |
| `website` | Official site |
| `bookingUrl` | External book link (TableCheck, Google, own site, etc.) |
| `mapsUrl` / lat·lng | Navigate |
| `instagram` / `facebook` / `tiktok` / `youtube` | Social (typed keys better than free `social` bag) |
| hours, address, categories, summary, description | Already mostly there |
| FAQ | Schema exists; use for “parking?”, “halal?”, “kids?” |

Public UI: show only filled fields; empty = omit (no “— Instagram” noise). Portal: completeness checklist % to nudge owners/agents.

## Options (if any)

- **A — Typed contact fields** on `Business` (clear API, easy CTAs).
- **B — Keep generic `social` map** — flexible, weaker validation/UI.
- **C — Hybrid** — first-class WA/phone/website/bookingUrl + `social` for the rest.

**Lean:** C for MVP speed; promote Instagram/Facebook to first-class if always shown.

## Open questions

- Is external `bookingUrl` enough at launch, or must in-platform booking always win when `bookingMode !== none`?
- Any channels to exclude (e.g. only WA + IG + FB + website + booking)?

## Next step

Pair with verification idea; then decide field list → schema/API/portal/public record (promote to implementation plan when approved).
