# Listing verification process & badge

| Field | Value |
|---|---|
| Status | `exploring` |
| Captured | 2026-09-07 |
| Updated | 2026-09-07 |
| Related | [complete listing profile](./2026-09-07-complete-listing-profile.md), [prevent fraud](./2026-09-07-prevent-platform-fraud.md), claims flow, field agents, [ops/security](../ops/security.md) |

## Problem / itch

Verification is hard. Visitors still need a clear signal that a listing is **real, owned, and recently confirmed**. Owner wants a **badge** when verified, and a process that actually makes sense for Indonesia field ops + WhatsApp — not a fake “blue check”.

## What “verified” must mean (proposal)

**Verified ≠ famous. Verified = Nusa has evidence this business exists and the contact/profile was confirmed recently.**

Claim approval alone is **ownership**, not freshness or on-the-ground truth. Do not use one stamp for both.

## Proposed states (public stamps)

| Stamp | Meaning | Who grants |
|---|---|---|
| _(none)_ | Listed / published, no extra trust | — |
| `Claimed` | Owner approved via claim | Admin (existing) |
| `Verified` | Claimed + contact challenge passed + profile min-complete + not stale | System rules |
| `Field verified` | Agent confirmed on site (strongest for Bali launch) | Field agent / admin |
| `Needs update` | Was verified; `lastVerifiedAt` older than freshness window | System (time) |

Use existing teletype `.stamp` style (text, no image badge art).

## Process that scales for a solo founder

### 1. Register (thin)
Field agent or owner creates listing. Status published/draft as today. No verified stamp.

### 2. Claim (ownership)
Existing claim → admin approve → `Claimed`. Proves someone controls the listing account, not that hours/WA are correct.

### 3. Contact challenge (cheap, high signal)
- Send 6-digit code via WhatsApp (or require owner to message a Nusa WA with listing code).
- On success: `contactVerifiedAt`.
- Indonesia-first: WhatsApp over SMS/email.

### 4. Completeness gate
Eligible for `Verified` only if minimum fields set, e.g.:

- name, place, ≥1 category, address **or** maps pin  
- hours (or explicit “hours vary”)  
- ≥1 contact: WhatsApp preferred  
- optional but counted toward “complete”: website, bookingUrl, Instagram/Facebook  

Portal shows **completeness %**; badge needs a threshold (e.g. ≥70% + WA).

### 5. Freshness (the hard part, made operational)
- Verified requires `lastVerifiedAt` within **90 days** (tunable).
- Owner taps **“Confirm listing is still correct”** in portal (or replies YES to a WA nudge later).
- Field agent can reset freshness after a visit (`Field verified`).
- When stale → stamp becomes `Needs update` (still listed; trust signal honest).

### 6. Dispute / fraud path
- Visitor or competitor flags listing → admin/agent review; can strip verified stamps.
- Tie to fraud idea note; rate-limit claims and contact challenges.

## Anti-patterns to avoid

- Selling a “verified” badge with no check (destroys trust).
- Showing Verified because the profile looks pretty or has photos (we’re text-first anyway).
- Equating Google Business scrape import with verification.
- Requiring photos for verification if public product stays no-images (evidence can stay private in portal).

## Data sketch (when implementing)

```
verification: {
  claimedAt?,
  contactVerifiedAt?,
  fieldVerifiedAt?,
  fieldVerifiedByAgentId?,
  lastVerifiedAt?,
  freshnessDays: 90
}
completenessScore: 0–100  // derived
```

Public API exposes stamp enum + `lastVerifiedAt` (date only).

## Options (if any)

- **A — Rules engine above (recommended)** — Claimed ≠ Verified; WA challenge + freshness + optional field verify.
- **B — Admin-only Verified** — simplest; won’t scale; OK for first 50 listings then painful.
- **C — Field-only Verified** — strong for Bali ground game; blocks remote owners.

**Lean:** A, with B as manual override for launch exceptions; C as upgrade path via `Field verified` stamp.

## Open questions

- Who may grant `Field verified` — any `field_agent`, or only admins after agent report?
- Freshness window: 60 / 90 / 180 days?
- Should stale listings stay in search ranking equally, or demote?

## Next step

Owner picks freshness window + who can field-verify; then promote to ADR + schema when ready to build (after complete-profile fields).
