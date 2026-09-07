# Fast text directory + vendor–visitor contact

| Field | Value |
|---|---|
| Status | `exploring` |
| Captured | 2026-09-07 |
| Updated | 2026-09-07 |
| Related | [teletype performance budget](../design/teletype.md), [personas](../product/personas.md), [features-parity — Private messages](../features-parity.md), [roadmap Phase 6](../product/roadmap.md), listing `whatsapp` / `phone` fields |

## Problem / itch

Most important product stance (owner, 2026-09-07):

1. **The platform must be fast** — competitive advantage on mobile / Indonesia networks.
2. **No images** — stronger than “lazy gallery below the fold”; treat media as out of scope for the public surface unless product revisits.
3. **Vendors and visitors must be able to communicate** — a directory without a contact path fails the journey.

Speed and “no images” reinforce each other. Contact must not break the speed story (no heavy chat SPA on public pages).

## Notes from chat

- Owner: “the most important aspect is that the platform is fast, no images, we must find a way for the vendors and visitors to communicate.”
- Existing design already budgets for text-first Astro (0 webfonts, 0 chrome images, minimal JS) — see teletype.
- Today’s contact path: listing shows `phone` / `whatsapp` when set; field agents capture WhatsApp on register; personas assume “opens listing → WhatsApp.”
- In-platform private messages are still **planned** (Phase 6), not built.
- Gallery / featured image still exist in schema + migration notes — conflicts with a hard “no images” rule until decided.

## Options (if any)

### Contact channel

- **A — WhatsApp / phone deep links only** — `wa.me` CTA on listing; owner manages chat in WhatsApp. Fast, zero inbox infra, matches Bali habits. Weak: no audit trail, number harvesting, hard to moderate.
- **B — Platform inbox (Phase 6)** — visitor → portal message without exposing number. Stronger trust/fraud story; costs product + auth friction; risk of making public surface heavier.
- **C — Hybrid** — public page stays one-tap WhatsApp (or “request contact”); optional portal inbox later for claimed owners / bookings. Keeps public path fast.

**Lean (pending owner):** C, with WhatsApp-first as the MVP contact path; defer full inbox until it earns its weight.

### Images

- **A — Hard ban** — no gallery, no featured image on public pages; drop or hide media fields in MVP UX.
- **B — Optional later** — keep schema; never ship images until an explicit decision.
- **C — Owner-opt-in below fold** — current teletype; owner said no, so demote unless they soften.

**Lean (pending owner):** A or B for launch narrative (“text-fast directory”).

## Open questions

- Is the primary contact path **WhatsApp deep link**, **in-app messaging**, or **hybrid**?
- Does “no images” mean forever for MVP/public, or “not yet / not required”?
- Should phone numbers stay visible, or only behind a WhatsApp / “contact” action (anti-scraping)?

## Next step

Confirm preferred contact channel (question in chat); then either promote speed+no-images as a short product principle / ADR and update teletype + parity, or keep exploring.
