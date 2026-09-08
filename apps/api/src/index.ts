import { serve } from "@hono/node-server";
import { applyStoreMigrations, hashStoredPasswords } from "@nusa/db";
import { app } from "./app.js";

const port = Number(process.env.PORT || 8787);

// An existing store is never re-seeded, so bring it up to date first —
// slugs are routing keys, and a stale one breaks host resolution and TLS
// issuance, not just a page.
const migrated = applyStoreMigrations();
if (migrated.length > 0) {
  console.log(`Applied store migration(s): ${migrated.join(", ")}`);
}

// Never leave the store at rest with readable passwords, including a store
// seeded before hashing existed.
const upgraded = await hashStoredPasswords();
if (upgraded > 0) {
  console.log(`Hashed ${upgraded} plaintext password(s) in the store`);
}

console.log(`Nusa API listening on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
