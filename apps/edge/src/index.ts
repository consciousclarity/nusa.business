/**
 * Nusa edge Worker — bootstrap front door for Cloudflare.
 *
 * Today: health + host introspection + KV smoke.
 * Next: proxy/SSR Astro + API, nested-host routing, R2 media.
 */

export interface Env {
  CACHE: KVNamespace;
  SESSIONS: KVNamespace;
  DB: D1Database;
  MEDIA?: R2Bucket;
  ORIGIN_WEB?: string;
  ORIGIN_API?: string;
  ENVIRONMENT: string;
}

function parseHost(host: string): {
  kind: "nation" | "island" | "place" | "unknown";
  island?: string;
  place?: string;
} {
  const h = host.split(":")[0]?.toLowerCase() ?? "";
  if (h === "nusa.business" || h.endsWith(".workers.dev")) {
    return { kind: "nation" };
  }
  if (!h.endsWith(".nusa.business")) return { kind: "unknown" };
  const sub = h.slice(0, -".nusa.business".length);
  const parts = sub.split(".").filter(Boolean);
  if (parts.length === 1) return { kind: "island", island: parts[0] };
  if (parts.length === 2) {
    return { kind: "place", place: parts[0], island: parts[1] };
  }
  return { kind: "unknown" };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const tenant = parseHost(url.host);

    if (url.pathname === "/health" || url.pathname === "/cf/health") {
      const cacheKey = `health:${env.ENVIRONMENT}`;
      await env.CACHE.put(cacheKey, new Date().toISOString(), {
        expirationTtl: 60,
      });
      const cached = await env.CACHE.get(cacheKey);
      return Response.json({
        ok: true,
        service: "nusa-edge",
        environment: env.ENVIRONMENT,
        tenant,
        cacheProbe: cached,
        bindings: {
          cache: Boolean(env.CACHE),
          sessions: Boolean(env.SESSIONS),
          d1: Boolean(env.DB),
          media: Boolean(env.MEDIA),
        },
      });
    }

    // Optional reverse-proxy to an existing origin (VPS) once DNS is live
    if (env.ORIGIN_WEB && tenant.kind !== "unknown") {
      const target = new URL(request.url);
      const origin = new URL(env.ORIGIN_WEB);
      target.protocol = origin.protocol;
      target.host = origin.host;
      return fetch(new Request(target.toString(), request));
    }

    const body = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Nusa.Business · Cloudflare edge</title>
  <style>
    body{font-family:system-ui,sans-serif;max-width:40rem;margin:3rem auto;padding:0 1rem;line-height:1.5;color:#1c2a24;background:#f3efe6}
    code{background:#fff;padding:.1rem .35rem;border-radius:4px}
    .card{background:#fffdf8;border:1px solid #d9d2c4;border-radius:12px;padding:1rem 1.2rem}
  </style>
</head>
<body>
  <div class="card">
    <h1>Nusa.Business</h1>
    <p>Cloudflare edge Worker is live (bootstrap).</p>
    <p>Tenant: <code>${tenant.kind}${tenant.island ? ` / ${tenant.island}` : ""}${tenant.place ? ` / ${tenant.place}` : ""}</code></p>
    <p>Host: <code>${url.host}</code></p>
    <p><a href="/cf/health">/cf/health</a></p>
    <p>Next: point <code>nusa.business</code> DNS at this Worker and attach the Astro/API origins.</p>
  </div>
</body>
</html>`;

    return new Response(body, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  },
} satisfies ExportedHandler<Env>;
