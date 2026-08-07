#!/usr/bin/env node
/**
 * Create / inspect the nusa.business Cloudflare zone and bootstrap DNS.
 *
 * Requires:
 *   CLOUDFLARE_API_TOKEN  — Zone:Edit + DNS:Edit
 *   CLOUDFLARE_ACCOUNT_ID — from dashboard URL / overview
 *
 * Optional:
 *   ORIGIN_IPV4 — if set, creates proxied A records for @ and *
 */

const token = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const originIp = process.env.ORIGIN_IPV4;
const zoneName = process.env.NUSA_ZONE || "nusa.business";

if (!token || !accountId) {
  console.error(`Missing credentials.

Create a token at https://dash.cloudflare.com/profile/api-tokens
Permissions: Zone → Zone:Edit, Zone → DNS:Edit (include zone nusa.business or all zones)

Then:

  $env:CLOUDFLARE_API_TOKEN="..."
  $env:CLOUDFLARE_ACCOUNT_ID="..."
  node scripts/cloudflare-setup-zone.mjs

Optional origin:

  $env:ORIGIN_IPV4="x.x.x.x"
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
    const records = [
      { type: "A", name: zoneName, content: originIp, proxied: true },
      { type: "A", name: `*.${zoneName}`, content: originIp, proxied: true },
    ];
    for (const island of [
      "bali",
      "jawa",
      "lombok",
      "sumatera",
      "sulawesi",
      "kalimantan",
      "maluku",
      "papua",
    ]) {
      records.push({
        type: "A",
        name: `*.${island}.${zoneName}`,
        content: originIp,
        proxied: true,
      });
    }

    for (const rec of records) {
      try {
        await cf(`/zones/${zone.id}/dns_records`, {
          method: "POST",
          body: JSON.stringify({ ...rec, ttl: 1 }),
        });
        console.log("DNS +", rec.type, rec.name);
      } catch (err) {
        console.warn("DNS skip/fail", rec.name, String(err.message || err));
      }
    }
  } else {
    console.log(
      "\nNo ORIGIN_IPV4 set — skipping A records. Prefer Workers Custom Domains for nusa-edge, or re-run with ORIGIN_IPV4.",
    );
  }

  console.log(`\nDashboard: https://dash.cloudflare.com/${accountId}/${zone.id}`);
  console.log("Next: docs/ops/cloudflare.md (ACM certs + wrangler deploy)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
