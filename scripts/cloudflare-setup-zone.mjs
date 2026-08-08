#!/usr/bin/env node
/**
 * Create / inspect the nusa.business Cloudflare zone and upsert DNS.
 *
 * Requires:
 *   CLOUDFLARE_API_TOKEN  — Zone:Edit + DNS:Edit
 *   CLOUDFLARE_ACCOUNT_ID — from dashboard URL / overview
 *
 * Optional:
 *   ORIGIN_IPV4 — if set, upserts A records (default 62.72.7.218 when set empty intentionally skip)
 *   NUSA_ZONE   — default nusa.business
 *
 * Record policy (nested hosts without per-place DNS):
 *   @, www, *           → ORIGIN, proxied (orange) — apex + island hosts
 *   *.{island}          → ORIGIN, DNS-only (grey) — place hosts need LE at origin
 */

const token = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const originIp = process.env.ORIGIN_IPV4;
const zoneName = process.env.NUSA_ZONE || "nusa.business";

/** Seed islands — keep in sync with packages/db/src/seed-data.ts */
const ISLANDS = [
  "bali",
  "java",
  "lombok",
  "sumatra",
  "sulawesi",
  "kalimantan",
  "maluku",
  "papua",
];

if (!token || !accountId) {
  console.error(`Missing credentials.

Create a token at https://dash.cloudflare.com/profile/api-tokens
Permissions: Zone → Zone:Edit, Zone → DNS:Edit (include zone nusa.business or all zones)

Then:

  export CLOUDFLARE_API_TOKEN="..."
  export CLOUDFLARE_ACCOUNT_ID="..."
  export ORIGIN_IPV4="62.72.7.218"
  npm run cf:zone
`);
  process.exit(1);
}

const api = "https://api.cloudflare.com/client/v4";

async function cf(path, init = {}) {
  const res = await fetch(`${api}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...(init.headers || {}),
    },
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(JSON.stringify(data.errors || data, null, 2));
  }
  return data.result;
}

/**
 * Upsert an A record by name: PATCH if one exists, else POST.
 */
async function upsertA(zoneId, { name, content, proxied }) {
  const existing = await cf(
    `/zones/${zoneId}/dns_records?type=A&name=${encodeURIComponent(name)}`,
  );
  const body = { type: "A", name, content, proxied, ttl: 1 };
  if (existing[0]) {
    const updated = await cf(`/zones/${zoneId}/dns_records/${existing[0].id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    console.log(
      "DNS ~",
      updated.name,
      "→",
      content,
      proxied ? "proxied" : "dns-only",
    );
    return updated;
  }
  const created = await cf(`/zones/${zoneId}/dns_records`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  console.log(
    "DNS +",
    created.name,
    "→",
    content,
    proxied ? "proxied" : "dns-only",
  );
  return created;
}

async function main() {
  const zones = await cf(
    `/zones?name=${encodeURIComponent(zoneName)}&account.id=${accountId}`,
  );
  let zone = zones[0];

  if (!zone) {
    console.log(`Creating zone ${zoneName}…`);
    zone = await cf("/zones", {
      method: "POST",
      body: JSON.stringify({
        name: zoneName,
        account: { id: accountId },
        type: "full",
      }),
    });
    console.log("Created zone", zone.id, "status=", zone.status);
  } else {
    console.log("Zone exists", zone.id, "status=", zone.status);
  }

  console.log("\nNameservers (set these at your registrar):");
  for (const ns of zone.name_servers || []) console.log(" -", ns);

  if (originIp) {
    // Apex + www + single-label wildcard (islands, api, portal, …)
    await upsertA(zone.id, {
      name: zoneName,
      content: originIp,
      proxied: true,
    });
    await upsertA(zone.id, {
      name: `www.${zoneName}`,
      content: originIp,
      proxied: true,
    });
    await upsertA(zone.id, {
      name: `*.${zoneName}`,
      content: originIp,
      proxied: true,
    });

    // Place-level wildcards — grey cloud so Caddy can issue real LE certs
    for (const island of ISLANDS) {
      await upsertA(zone.id, {
        name: `*.${island}.${zoneName}`,
        content: originIp,
        proxied: false,
      });
    }
  } else {
    console.log(
      "\nNo ORIGIN_IPV4 set — skipping A records. Re-run with ORIGIN_IPV4=62.72.7.218.",
    );
  }

  console.log(`\nDashboard: https://dash.cloudflare.com/${accountId}/${zone.id}`);
  console.log(
    "Nested place hosts (*.{island}) are DNS-only — see docs/ops/cloudflare.md",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
