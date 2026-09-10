import type { Island, Place } from "./types.js";
import {
  ADMIN_PROVINCES,
  ADMIN_REGENCIES,
} from "./indonesia-admin.js";

/** Geographic island groups that still have a one-label hub (not a province). */
export const REGION_HUBS: Island[] = [
  {
    id: "isl-java",
    slug: "java",
    name: "Java",
    tagline: "Six provinces — from Jakarta to Banyuwangi.",
    status: "active",
    kind: "region",
    region: "java",
  },
  {
    id: "isl-sumatra",
    slug: "sumatra",
    name: "Sumatra",
    tagline: "Ten provinces from Aceh to Lampung and the Riau islands.",
    status: "active",
    kind: "region",
    region: "sumatra",
  },
  {
    id: "isl-sulawesi",
    slug: "sulawesi",
    name: "Sulawesi",
    tagline: "Six provinces — Makassar, Manado, and the peninsulas.",
    status: "active",
    kind: "region",
    region: "sulawesi",
  },
  {
    id: "isl-kalimantan",
    slug: "kalimantan",
    name: "Kalimantan",
    tagline: "Five provinces on Borneo’s Indonesian shores.",
    status: "active",
    kind: "region",
    region: "kalimantan",
  },
];

export const GEO_REGION_ORDER = [
  "sumatra",
  "java",
  "bali",
  "nusa-tenggara",
  "kalimantan",
  "sulawesi",
  "maluku",
  "papua",
] as const;

const PLACE_SUMMARY: Record<string, string> = {
  "pl-badung": "South Bali — surf coasts, Canggu, and the Bukit.",
  "pl-gianyar": "Cultural heartland — babi guling, silver, batik.",
  "pl-denpasar": "Provincial capital and everyday Bali.",
  "pl-buleleng": "North-coast Bali — Lovina and black-sand villages.",
  "pl-karangasem": "East Bali — Amed, Agung, and traditional villages.",
  "pl-yogya": "Gudeg, batik, and gateways to Borobudur.",
  "pl-bandung": "Cool highlands, coffee, and shopping.",
  "pl-surabaya": "East Java’s port city and culinary hub.",
  "pl-lombok-utara": "North Lombok and the Gili islands.",
  "pl-lombok-tengah": "Central Lombok — Kuta and south-coast surf.",
  "pl-medan": "Sumatra’s largest city and food capital.",
  "pl-makassar": "Coto, phinisi, and Sulawesi gateway.",
};

const TOURIST_AREAS: Place[] = [
  {
    id: "pl-uluwatu",
    islandId: "isl-bali",
    slug: "uluwatu",
    name: "Uluwatu",
    type: "tourist_area",
    parentPlaceId: "pl-badung",
    summary: "Cliff temples, surf breaks, and sunset kecak.",
  },
  {
    id: "pl-jimbaran",
    islandId: "isl-bali",
    slug: "jimbaran",
    name: "Jimbaran",
    type: "tourist_area",
    parentPlaceId: "pl-badung",
    summary: "Bay seafood and beach warungs.",
  },
  {
    id: "pl-ubud",
    islandId: "isl-bali",
    slug: "ubud",
    name: "Ubud",
    type: "tourist_area",
    parentPlaceId: "pl-gianyar",
    summary: "Rice terraces, wellness, and arts.",
  },
  {
    id: "pl-canggu",
    islandId: "isl-bali",
    slug: "canggu",
    name: "Canggu",
    type: "tourist_area",
    parentPlaceId: "pl-badung",
    summary: "Surf, cafés, and digital-nomad energy.",
  },
  {
    id: "pl-seminyak",
    islandId: "isl-bali",
    slug: "seminyak",
    name: "Seminyak",
    type: "tourist_area",
    parentPlaceId: "pl-badung",
    summary: "Beach clubs, boutiques, and nightlife.",
  },
  {
    id: "pl-sanur",
    islandId: "isl-bali",
    slug: "sanur",
    name: "Sanur",
    type: "tourist_area",
    parentPlaceId: "pl-denpasar",
    summary: "Quiet east-coast beaches and family stays.",
  },
  {
    id: "pl-kuta",
    islandId: "isl-bali",
    slug: "kuta",
    name: "Kuta",
    type: "tourist_area",
    parentPlaceId: "pl-badung",
    summary: "Classic beach strip and arrivals hub.",
  },
  {
    id: "pl-nusa-dua",
    islandId: "isl-bali",
    slug: "nusa-dua",
    name: "Nusa Dua",
    type: "tourist_area",
    parentPlaceId: "pl-badung",
    summary: "Resort peninsula on the Bukit.",
  },
  {
    id: "pl-lovina",
    islandId: "isl-bali",
    slug: "lovina",
    name: "Lovina",
    type: "tourist_area",
    parentPlaceId: "pl-buleleng",
    summary: "North-coast dolphins and black sand.",
  },
  {
    id: "pl-amed",
    islandId: "isl-bali",
    slug: "amed",
    name: "Amed",
    type: "tourist_area",
    parentPlaceId: "pl-karangasem",
    summary: "Diving villages on the east coast.",
  },
  {
    id: "pl-gili-t",
    islandId: "isl-nusa-tenggara-barat",
    slug: "gili-trawangan",
    name: "Gili Trawangan",
    type: "tourist_area",
    parentPlaceId: "pl-lombok-utara",
    summary: "Diving, nightlife, and island hopping.",
  },
  {
    id: "pl-kuta-lombok",
    islandId: "isl-nusa-tenggara-barat",
    slug: "kuta",
    name: "Kuta Lombok",
    type: "tourist_area",
    parentPlaceId: "pl-lombok-tengah",
    summary: "South Lombok surf camps.",
  },
  {
    id: "pl-jakarta",
    islandId: "isl-dki-jakarta",
    slug: "jakarta",
    name: "Jakarta",
    type: "tourist_area",
    parentPlaceId: "pl-adm-3173",
    summary: "Capital metro — food, culture, business.",
  },
];

export function buildGeography(): { islands: Island[]; places: Place[] } {
  const islands: Island[] = [
    ...ADMIN_PROVINCES.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      status: "active" as const,
      kind: "province" as const,
      region: p.region,
    })),
    ...REGION_HUBS,
  ];

  const adminPlaces: Place[] = ADMIN_REGENCIES.map((p) => ({
    id: p.id,
    islandId: p.islandId,
    slug: p.slug,
    name: p.name,
    type: p.type,
    summary: PLACE_SUMMARY[p.id] ?? p.summary,
  }));

  return { islands, places: [...adminPlaces, ...TOURIST_AREAS] };
}
