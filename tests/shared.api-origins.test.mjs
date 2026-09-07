import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertBrowserSafeApiOrigin,
  resolveBrowserApiOrigin,
  resolveSsrApiOrigin,
} from "@nusa/shared";

/**
 * C03: browser-facing API origins must never embed Compose/internal hosts.
 * SSR may still use http://api:8787 on the Docker network.
 */

describe("assertBrowserSafeApiOrigin", () => {
  it("allows a public https origin in production", () => {
    assert.equal(
      assertBrowserSafeApiOrigin("https://api.nusa.business", {
        production: true,
      }),
      "https://api.nusa.business",
    );
    assert.equal(
      assertBrowserSafeApiOrigin("https://api.nusa.business/", {
        production: true,
      }),
      "https://api.nusa.business",
    );
  });

  it("rejects localhost and loopback in production", () => {
    assert.throws(
      () =>
        assertBrowserSafeApiOrigin("http://localhost:8787", {
          production: true,
        }),
      /https|internal|local/i,
    );
    assert.throws(
      () =>
        assertBrowserSafeApiOrigin("https://127.0.0.1:8787", {
          production: true,
        }),
      /internal|local/i,
    );
  });

  it("rejects Compose-internal http://api:8787 for browsers", () => {
    assert.throws(
      () =>
        assertBrowserSafeApiOrigin("http://api:8787", { production: true }),
      /https|internal|local/i,
    );
    assert.throws(
      () =>
        assertBrowserSafeApiOrigin("https://api:8787", { production: true }),
      /internal|local/i,
    );
  });

  it("rejects missing browser origin in production", () => {
    assert.throws(
      () => assertBrowserSafeApiOrigin("", { production: true }),
      /required in production/i,
    );
  });

  it("defaults to localhost when empty in development", () => {
    assert.equal(
      assertBrowserSafeApiOrigin("", { production: false }),
      "http://localhost:8787",
    );
  });
});

describe("resolveSsrApiOrigin", () => {
  it("allows SSR to use the Compose-internal API URL", () => {
    assert.equal(
      resolveSsrApiOrigin({
        production: true,
        NUSA_SSR_API_URL: "http://api:8787",
      }),
      "http://api:8787",
    );
  });

  it("requires NUSA_SSR_API_URL in production when unset", () => {
    assert.throws(
      () => resolveSsrApiOrigin({ production: true }),
      /NUSA_SSR_API_URL|required in production/i,
    );
  });

  it("falls back to localhost / PUBLIC_* in development", () => {
    assert.equal(
      resolveSsrApiOrigin({ production: false }),
      "http://localhost:8787",
    );
    assert.equal(
      resolveSsrApiOrigin({
        production: false,
        PUBLIC_API_URL: "http://localhost:8787",
      }),
      "http://localhost:8787",
    );
  });
});

describe("resolveBrowserApiOrigin", () => {
  it("prefers PUBLIC_BROWSER_API_URL over legacy PUBLIC_API_URL", () => {
    assert.equal(
      resolveBrowserApiOrigin({
        production: true,
        PUBLIC_BROWSER_API_URL: "https://api.nusa.business",
        PUBLIC_API_URL: "http://api:8787",
      }),
      "https://api.nusa.business",
    );
  });

  it("still validates legacy PUBLIC_API_URL when used alone", () => {
    assert.throws(
      () =>
        resolveBrowserApiOrigin({
          production: true,
          PUBLIC_API_URL: "http://api:8787",
        }),
      /https|internal|local/i,
    );
  });
});
