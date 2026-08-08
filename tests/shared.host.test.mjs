import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseDevHostPath, parseHost, toSlug } from "@nusa/shared";

/**
 * parseHost is the load-bearing function of the whole product: it turns a Host
 * header into the geo context every surface renders from. These tests pin the
 * nested-tenancy contract described in AGENTS.md.
 *
 * Run against the built package (dist), i.e. what actually ships.
 */

describe("parseHost", () => {
  it("treats the bare domain as the nation", () => {
    assert.deepEqual(parseHost("nusa.business"), { kind: "nation" });
    assert.deepEqual(parseHost("localhost"), { kind: "nation" });
    assert.deepEqual(parseHost("127.0.0.1"), { kind: "nation" });
  });

  it("reads one label as an island", () => {
    assert.deepEqual(parseHost("bali.nusa.business"), {
      kind: "island",
      island: "bali",
    });
    assert.deepEqual(parseHost("bali.localhost"), {
      kind: "island",
      island: "bali",
    });
  });

  it("reads two labels as place-within-island, in that order", () => {
    assert.deepEqual(parseHost("gianyar.bali.nusa.business"), {
      kind: "place",
      place: "gianyar",
      island: "bali",
    });
  });

  it("strips the port", () => {
    assert.deepEqual(parseHost("bali.localhost:4321"), {
      kind: "island",
      island: "bali",
    });
  });

  it("is case-insensitive and tolerates whitespace", () => {
    assert.deepEqual(parseHost("  GIANYAR.Bali.Nusa.Business  "), {
      kind: "place",
      place: "gianyar",
      island: "bali",
    });
  });

  it("rejects hosts three or more labels deep", () => {
    // The product defines tenancy as at most place.island — anything deeper is
    // not a tenant, and must not be treated as one.
    assert.equal(parseHost("a.b.c.nusa.business").kind, "unknown");
  });

  it("rejects foreign domains", () => {
    assert.deepEqual(parseHost("evil.example.com"), {
      kind: "unknown",
      host: "evil.example.com",
    });
    // A Codespaces / preview host is not a tenant root.
    assert.equal(parseHost("abc-4321.app.github.dev").kind, "unknown");
  });

  it("does not treat a lookalike suffix as ours", () => {
    assert.equal(parseHost("notnusa.business").kind, "unknown");
    assert.equal(parseHost("nusa.business.evil.com").kind, "unknown");
  });

  it("falls back to nation on empty input", () => {
    assert.deepEqual(parseHost(""), { kind: "nation" });
  });
});

describe("parseDevHostPath", () => {
  it("maps /host/{island} to an island context", () => {
    assert.deepEqual(parseDevHostPath("/host/bali"), {
      context: { kind: "island", island: "bali" },
      pathname: "/",
    });
  });

  it("maps /host/{place}.{island} to a place context and keeps the rest", () => {
    assert.deepEqual(parseDevHostPath("/host/gianyar.bali/babi-guling"), {
      context: { kind: "place", place: "gianyar", island: "bali" },
      pathname: "/babi-guling",
    });
  });

  it("returns null for non-host paths", () => {
    assert.equal(parseDevHostPath("/claim"), null);
    assert.equal(parseDevHostPath("/"), null);
  });
});

describe("toSlug", () => {
  it("kebab-cases and lowercases", () => {
    assert.equal(toSlug("Babi Guling Pande Egi"), "babi-guling-pande-egi");
  });

  it("strips diacritics and punctuation", () => {
    assert.equal(toSlug("Café  Lombok!!"), "cafe-lombok");
  });

  it("collapses separators and trims them from the ends", () => {
    assert.equal(toSlug("  --Warung__Bali--  "), "warung-bali");
  });
});
