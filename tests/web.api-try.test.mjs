import assert from "node:assert/strict";
import { createServer } from "node:http";
import { describe, it } from "node:test";

/** Mirrors apps/web/src/lib/api.ts apiTry — connection refused / 5xx / timeout → null. */
async function apiTry(url, timeoutMs = 5000) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

describe("apiTry contract (homepage/search degrade)", () => {
  it("returns JSON when the origin is up", async () => {
    const server = createServer((_req, res) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ islands: [{ slug: "bali" }] }));
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    try {
      const data = await apiTry(`http://127.0.0.1:${port}/v1/islands`);
      assert.equal(data.islands[0].slug, "bali");
    } finally {
      server.close();
    }
  });

  it("returns null on 503 instead of throwing", async () => {
    const server = createServer((_req, res) => {
      res.writeHead(503);
      res.end("down");
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    try {
      assert.equal(await apiTry(`http://127.0.0.1:${port}/v1/islands`), null);
    } finally {
      server.close();
    }
  });

  it("returns null when the origin is unreachable", async () => {
    assert.equal(await apiTry("http://127.0.0.1:9/v1/islands"), null);
  });
});
