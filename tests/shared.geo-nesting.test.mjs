import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { geoNesting, hostPath, publicHostLine, publicUrl } from "@nusa/shared";

/**
 * Global public URL rule: the host is the administrative parent
 * (kabupaten/kota). Nested tourist areas live in the path.
 *
 *   gianyar.bali.nusa.business/ubud/warung-babi-guling-ibu-oka
 */

const gianyar = {
  id: "pl-gianyar",
  slug: "gianyar",
  type: "kabupaten",
};
const ubud = {
  id: "pl-ubud",
  slug: "ubud",
  type: "tourist_area",
  parentPlaceId: "pl-gianyar",
};
const denpasar = {
  id: "pl-denpasar",
  slug: "denpasar",
  type: "kota",
};
const sanur = {
  id: "pl-sanur",
  slug: "sanur",
  type: "tourist_area",
  parentPlaceId: "pl-denpasar",
};
const orphan = {
  id: "pl-orphan",
  slug: "mystery-cove",
  type: "tourist_area",
};
const nestedUnderArea = {
  id: "pl-alley",
  slug: "monkey-forest",
  type: "tourist_area",
  parentPlaceId: "pl-ubud",
};

const byId = Object.fromEntries(
  [gianyar, ubud, denpasar, sanur, orphan, nestedUnderArea].map((p) => [
    p.id,
    p,
  ]),
);

describe("geoNesting — administrative host, area in the path", () => {
  it("nests a tourist area under its kabupaten", () => {
    assert.deepEqual(geoNesting(ubud, byId), {
      hostPlace: "gianyar",
      area: "ubud",
    });
  });

  it("nests a tourist area under its kota", () => {
    assert.deepEqual(geoNesting(sanur, byId), {
      hostPlace: "denpasar",
      area: "sanur",
    });
  });

  it("keeps kabupaten and kota as their own hosts", () => {
    assert.deepEqual(geoNesting(gianyar, byId), { hostPlace: "gianyar" });
    assert.deepEqual(geoNesting(denpasar, byId), { hostPlace: "denpasar" });
  });

  it("keeps an orphan tourist area as its own host", () => {
    assert.deepEqual(geoNesting(orphan, byId), { hostPlace: "mystery-cove" });
  });

  it("does not nest a tourist area under another tourist area", () => {
    // One path segment only: village-under-Ubud stays data, not URL depth.
    assert.deepEqual(geoNesting(nestedUnderArea, byId), {
      hostPlace: "monkey-forest",
    });
  });
});

describe("publicUrl / hostPath follow geo nesting", () => {
  it("builds the Ibu Oka canonical URL under Gianyar/Ubud", () => {
    assert.equal(
      publicUrl({
        island: "bali",
        place: "gianyar",
        area: "ubud",
        slug: "warung-babi-guling-ibu-oka",
      }),
      "https://gianyar.bali.nusa.business/ubud/warung-babi-guling-ibu-oka",
    );
    assert.equal(
      hostPath({
        island: "bali",
        place: "gianyar",
        area: "ubud",
        slug: "warung-babi-guling-ibu-oka",
      }),
      "/host/gianyar.bali/ubud/warung-babi-guling-ibu-oka",
    );
    assert.equal(
      publicHostLine({
        island: "bali",
        place: "gianyar",
        area: "ubud",
        slug: "warung-babi-guling-ibu-oka",
      }),
      "gianyar.bali.nusa.business/ubud/warung-babi-guling-ibu-oka",
    );
  });

  it("keeps listings attached to the kabupaten on the host path", () => {
    assert.equal(
      publicUrl({
        island: "bali",
        place: "gianyar",
        slug: "babi-guling-pande-egi",
      }),
      "https://gianyar.bali.nusa.business/babi-guling-pande-egi",
    );
    assert.equal(
      hostPath({
        island: "bali",
        place: "gianyar",
        slug: "babi-guling-pande-egi",
      }),
      "/host/gianyar.bali/babi-guling-pande-egi",
    );
  });

  it("builds an area hub URL with no listing slug", () => {
    assert.equal(
      publicUrl({ island: "bali", place: "gianyar", area: "ubud" }),
      "https://gianyar.bali.nusa.business/ubud",
    );
    assert.equal(
      hostPath({ island: "bali", place: "gianyar", area: "ubud" }),
      "/host/gianyar.bali/ubud",
    );
  });

  it("builds category and facet browse URLs", () => {
    assert.equal(
      publicUrl({
        island: "bali",
        place: "gianyar",
        area: "ubud",
        category: "warungs-local-food",
        facet: "cuisine",
        facetValue: "balinese",
      }),
      "https://gianyar.bali.nusa.business/ubud/c/warungs-local-food/cuisine/balinese",
    );
  });
});
