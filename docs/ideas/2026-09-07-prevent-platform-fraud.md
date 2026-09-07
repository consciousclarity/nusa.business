# Prevent platform fraud

| Field | Value |
|---|---|
| Status | `seed` |
| Captured | 2026-09-07 |
| Updated | 2026-09-07 |
| Related | [ops/security.md](../ops/security.md), claims / reviews / field registration |

## Problem / itch

Directory + claims + field agents + marketplace surfaces invite fake listings, stolen business identity, review abuse, and booking/payment scams. Solo founder needs a lightweight fraud posture before scale — not a full risk org.

## Notes from chat

- Owner asked how to keep brainstorms durable; fraud prevention called out as an example topic that must live in the repo, not only in Cursor chat.
- Existing MVP security caveats (plaintext demo passwords, predictable bearer tokens, no rate limits / audit log) are adjacent but not the full fraud story — see [ops/security.md](../ops/security.md).
- Later same day: listing **verification badge** and completeness — see [listing verification](./2026-09-07-listing-verification.md); fake verified stamps are a fraud vector.

## Options (if any)

_Not explored yet._ Next brainstorm should cover claim verification, listing authenticity, agent misuse, and review/booking abuse separately.

## Open questions

- Which fraud classes matter first for Bali launch (fake listings vs claim theft vs marketplace)?
- What can stay manual (WhatsApp / field agent) vs need product gates?
- How does free listings / 0% commission change attacker incentives?

## Next step

Continue brainstorming with Cursor; agent updates this note from `seed` → `exploring` as options appear.
