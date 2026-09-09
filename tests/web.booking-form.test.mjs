import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { runInNewContext } from "node:vm";
import { it } from "node:test";

it("booking form sends enabled values, reuses keys on unchanged retries and rotates after edits", async () => {
  const source = readFileSync(new URL("../apps/web/src/pages/host/[label]/[slug].astro", import.meta.url), "utf8");
  const script = source.match(/<script define:vars=[^>]*>([\s\S]*?)<\/script>/)[1];
  const fields = [
    { name: "customerName", value: "Sam", disabled: false },
    { name: "customerEmail", value: "sam@example.test", disabled: false },
    { name: "startDate", value: "2026-05-01", disabled: false },
  ];
  let submit;
  const form = {
    dataset: {},
    querySelectorAll: () => fields,
    addEventListener: (_, handler) => { submit = handler; },
    reset: () => { fields.forEach((field) => { field.value = ""; }); },
  };
  const calls = [];
  runInNewContext(script, {
    apiBase: "http://example.test", businessId: "biz-test",
    // The page's single script also carries the nearby-discovery bootstrap;
    // with no [data-nearby-root] in this sandbox it returns early, leaving
    // the booking behaviour under test untouched.
    document: {
      getElementById: (id) => id === "booking-form" ? form : null,
      querySelector: () => null,
    },
    crypto: { randomUUID },
    FormData: class {
      constructor() { this.values = new Map(fields.filter((field) => !field.disabled).map((field) => [field.name, field.value])); }
      get(name) { return this.values.get(name) ?? null; }
    },
    fetch: async (_, options) => {
      calls.push(options);
      throw new Error("Lost response");
    },
  });
  await submit({ preventDefault() {} });
  assert.deepEqual(JSON.parse(calls[0].body), { customerName: "Sam", customerEmail: "sam@example.test", startDate: "2026-05-01" });
  assert.ok(fields.every((field) => !field.disabled));
  await submit({ preventDefault() {} });
  assert.equal(calls[1].headers["idempotency-key"], calls[0].headers["idempotency-key"]);
  fields[2].value = "2026-05-02";
  await submit({ preventDefault() {} });
  assert.notEqual(calls[2].headers["idempotency-key"], calls[1].headers["idempotency-key"]);
  assert.equal(JSON.parse(calls[2].body).startDate, "2026-05-02");
});
