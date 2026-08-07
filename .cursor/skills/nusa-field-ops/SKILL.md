---
name: nusa-field-ops
description: >-
  Field-agent on-the-ground registration workflow for Nusa.Business. Use when
  building agent tools, bulk listing capture, WhatsApp contact fields, or
  "just registered" place-hub strips.
---

# Field ops skill

## Loop

1. Agent arrives at a place (or creates place hub if missing).  
2. Registers business with photos / WhatsApp / address.  
3. Listing publishes as `published` with `registeredByAgentId`.  
4. Owner later **claims for free**.  
5. Optional: enable vendor shop (Dokan/Mercur parity).

## API

`POST /v1/field/register` — requires `field_agent` or `admin`.

`GET /v1/field/recent` — feeds place-hub “just registered” strip.

## Portal

`apps/portal` → Field ops page. Demo: `agent@nusa.business` / `agent123`.

## UX rules

- Optimize for mobile / one-hand capture.  
- Prefer WhatsApp over email for Indonesian SMEs.  
- Never charge field registration in the default product model.  
- Surface agent-registered listings on the place hub immediately.
