# Demo accounts and production bootstrap

## Local development

Missing `NUSA_DATA_DIR/store.json` auto-creates the **demo catalog** (sample
businesses + published demo users) when `NODE_ENV` is not `production`.

`npm run seed` rewrites the store with that catalog. Use only against disposable
directories — seeding replaces the file.

Portal login shows and prefills demo credentials only in Vite `import.meta.env.DEV`
(or when `VITE_NUSA_DEMO_LOGIN=true` for an explicit staging build).

## Production

Compose sets `NODE_ENV=production`. In that mode:

1. **Existing stores are never re-seeded** — migrations and password hashing only.
2. **Missing stores do not create demo users or sample businesses.**
3. First boot requires either:
   - restoring a backup into `NUSA_DATA_DIR`, or
   - setting bootstrap admin env vars (below) to create a **geography-only**
     store (islands/places) plus one admin account.
4. `NUSA_ALLOW_DEMO_SEED=1` can force the demo catalog even in production — do
   **not** use this on the public VPS.

### Bootstrap admin (empty volume)

```bash
NUSA_BOOTSTRAP_ADMIN_EMAIL=you@example.com
NUSA_BOOTSTRAP_ADMIN_PASSWORD='…at least 16 characters…'
# optional:
# NUSA_BOOTSTRAP_ADMIN_NAME='Site Admin'
```

After first successful login:

1. Change the admin password (portal/API once self-service exists; until then
   replace the hash in a controlled maintenance window).
2. Unset the bootstrap env vars from the host `.env` so a wiped volume cannot
   recreate the same password from config.
3. Rotate `NUSA_AUTH_SECRET` if the bootstrap password may have leaked — this
   invalidates all bearer sessions.

## Operator dry-run: inventory possible demo access

Do **not** delete accounts solely because an email matches a demo address.
Someone may legitimately use `admin@nusa.business` in production.

Known **seed** emails (local catalog only):

- `admin@nusa.business`
- `agent@nusa.business`
- `owner@example.com`

Dry-run inventory (read-only, redacted):

```bash
# On the VPS, with the API volume mounted read-only if possible:
node --input-type=module <<'EOF'
import { readFileSync } from 'node:fs';
const store = JSON.parse(readFileSync(process.env.NUSA_DATA_DIR + '/store.json', 'utf8'));
const demo = new Set([
  'admin@nusa.business',
  'agent@nusa.business',
  'owner@example.com',
]);
for (const u of store.users) {
  const flag = demo.has(u.email.toLowerCase()) ? 'SEED_EMAIL_MATCH' : 'other';
  console.log([flag, u.id, u.role, u.email].join('\t'));
}
console.log('users=', store.users.length, 'businesses=', store.businesses.length);
EOF
```

If a match is confirmed **demo** (weak/known password, no real ownership):

1. Take a backup of `store.json`.
2. Disable or remove that user only after confirming no legitimate ownership.
3. Rotate `NUSA_AUTH_SECRET` to invalidate sessions.
4. Re-check bookings/claims tied to that `user.id`.

Password hashing does **not** make published demo passwords safe.

## Rollback

Restore the previous `store.json` from backup and restart the API container.
Unset any unintended `NUSA_ALLOW_DEMO_SEED`.
