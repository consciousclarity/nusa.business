# Listing verification process & badge

| Field | Value |
|---|---|
| Status | `exploring` |
| Captured | 2026-09-07 |
| Updated | 2026-09-07 |
| Related | [complete listing profile](./2026-09-07-complete-listing-profile.md), [prevent fraud](./2026-09-07-prevent-platform-fraud.md), claims flow, field agents, [ops/security](../ops/security.md) |

## Problem / itch

Verification is hard. Visitors still need a clear signal that a listing is **real, owned, and currently trustworthy**. Owner wants a **badge**, and a process that makes sense for Indonesia field ops + WhatsApp — not a fake “blue check”.

Owner correction (2026-09-07): it is **constant verification**, not a one-shot check that expires every 60/90/180 days. Trust must be maintained by ongoing signals, not a calendar stamp alone.

## What “verified” must mean (proposal)

**Verified ≠ famous. Verified = Nusa has a living chain of evidence that this business exists, is owned, and contact/profile still check out.**

Claim approval alone is **ownership**, not ongoing truth. Do not use one stamp for both.

## Constant verification (core idea)

Verification is a **loop**, not a certificate with an anniversary date.

```
signals in  →  trust state  →  public stamp
     ↑                              │
     └──── owner / agent / system ──┘
```

Every meaningful event **feeds** the loop. Silence or contradiction **weakens** it. A fixed “re-verify every N days” checkbox can be a **backstop nudge**, never the whole model.

### Positive signals (raise / refresh trust)

| Signal | Who | Why it counts |
|---|---|---|
| Claim approved | Admin | Ownership established |
| WhatsApp contact challenge passed | Owner | Channel works and is controlled |
| Profile edit that passes validation | Owner / agent | Someone is maintaining truth |
| Completeness threshold met | System | Enough fields to be useful |
| Owner confirms disputed field | Owner | Explicit attestation |
| Successful visitor→vendor contact outcome (later) | Soft | Optional; careful with privacy |
| Field agent on-site check | Agent | Strongest Bali ground truth |
| Booking completed / no-show handled honestly (later) | Soft | Operational liveness |

### Negative signals (weaken / strip trust)

| Signal | Effect |
|---|---|
| Visitor / competitor flag upheld | Strip or demote stamp |
| WA number bounces / reports spam | Strip contact-verified |
| Owner unreachable after challenge re-ask | Demote to `Needs update` |
| Long silence with zero signals | Trust **decays** (see below) |
| Contradictory field reports | Hold Verified until resolved |

### Decay (not a hard anniversary)

Instead of “badge dies on day 90”:

- Maintain `trustScore` (or equivalent) from weighted recent signals.
- Public stamp derived from score + hard gates (must stay claimed + contact OK + min completeness).
- **Decay curve:** unused verified listings slowly lose score; when they cross a floor → stamp becomes `Needs update` (still listed; honest).
- **Nudge, don’t cliff:** portal + optional WA: “We haven’t seen activity — confirm listing still correct?” — that confirm is another positive signal, not the only one.

Calendar windows (60/90/180) may still configure **nudge timing** and decay half-life — they are knobs on continuous trust, not the product story.

## Proposed states (public stamps)

| Stamp | Meaning | How it stays true |
|---|---|---|
| _(none)_ | Listed / published | Default |
| `Claimed` | Owner approved via claim | Until claim revoked |
| `Verified` | Living trust above threshold + hard gates | Continuous signals; decays without them |
| `Field verified` | Agent confirmed on site (strong) | Agent re-check or decay into `Verified` / `Needs update` |
| `Needs update` | Was trusted; signals went cold or conflict | Honest demotion; can climb back |

Use existing teletype `.stamp` style (text, no image badge art).

## Process ladder (still needed once)

### 1. Register (thin)
Field agent or owner creates listing. No verified stamp.

### 2. Claim (ownership)
Claim → admin approve → `Claimed`.

### 3. Contact challenge (cheap, high signal)
WhatsApp code / reply-to-Nusa-WA. Sets contact-verified; **re-run when number changes** (constant: channel always re-proven on change).

### 4. Completeness gate
Min fields for `Verified` eligibility (address/maps, hours or “hours vary”, WA preferred, etc.). Completeness % in portal; editing fields is an ongoing signal.

### 5. Stay verified (the constant part)
- Edits, agent visits, successful contact challenges, periodic soft nudges → refresh trust.
- Flags, dead WA, silence → decay / `Needs update`.
- Changing WhatsApp or booking URL **requires re-challenge** before Verified returns.

### 6. Dispute / fraud path
Flag → review → strip stamps. Rate-limit challenges. Tie to fraud note.

## Anti-patterns to avoid

- Selling a “verified” badge with no check.
- One annual “I confirm” click that does nothing else all year (that’s fake constant).
- Equating Google scrape import with verification.
- Requiring public photos for verification (evidence can stay portal-private).
- Treating claim approval as forever-verified.

## Data sketch (when implementing)

```
verification: {
  claimedAt?,
  contactVerifiedAt?,
  contactChannelFingerprint?,  // hash of WA/phone; change → re-challenge
  fieldVerifiedAt?,
  fieldVerifiedByAgentId?,
  trustScore: number,           // derived + stored snapshot
  lastPositiveSignalAt?,
  lastNegativeSignalAt?,
  signals: [ { type, at, by? } ] // audit trail (portal/admin)
}
completenessScore: 0–100  // derived
```

Public API: stamp enum + maybe `lastPositiveSignalAt` (date), not internal score details.

## Options (if any)

- **A — Continuous trust loop (recommended)** — signals + decay + nudges; claim ≠ verified.
- **B — Admin-only Verified** — won’t scale; OK as override.
- **C — Field-only Verified** — strong for Bali; blocks remote owners; can be a stamp tier inside A.

**Lean:** A, with B override and C as `Field verified` tier.

## Open questions

- Who may grant `Field verified` — any `field_agent`, or admin after agent report?
- Decay half-life / nudge cadence (product knobs — not “the” verification definition)?
- Demote stale/`Needs update` in search ranking, or only in UI stamp?

## Next step

Lock continuous-loop model (vs calendar-only). Then choose field-verify authority + nudge cadence → ADR + schema after complete-profile fields.
