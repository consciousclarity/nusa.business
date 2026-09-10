import { canonicalizeCategory } from "@nusa/shared";
import { buildGeography } from "./geo-seed.js";
import { backfillListingCoords } from "./listing-coords.js";
import type { DataStore } from "./types.js";

/**
 * Store migrations.
 *
 * The JSON store is seeded once and then persisted (in production, on the
 * `api_data` volume). `ensureStore()` only seeds when the file is absent, so a
 * change to `seed-data.ts` never reaches a store that already exists — a
 * redeploy silently keeps the old values.
 *
 * That matters most for slugs, because they are routing keys. If the store
 * still says `jawa` while Caddy and DNS have moved to `java`, requests 404 and
 * `/v1/tls-check` refuses the host, which means Caddy never issues a
 * certificate for it — a TLS failure, not just a missing page.
 *
 * The inverse also breaks production: if the store (and seed) say `java` but
 * Cloudflare still only has a grey-cloud `*.jawa` wildcard, place hosts under
 * `*.java.nusa.business` fall through to the orange `*` record and HTTPS
 * handshake-fails. Re-run `npm run cf:zone` after every island slug rename.
 *
 * Each migration is idempotent: running it twice is a no-op, so it is safe to
 * apply on every boot.
 */

type Migration = {
  id: string;
  /** Returns true when it changed something. */
  apply: (store: DataStore) => boolean;
};

/** Rename an island's id, slug and display name, repointing its places. */
function renameIsland(
  store: DataStore,
  from: { id: string; slug: string },
  to: { id: string; slug: string; name: string },
): boolean {
  const island = store.islands.find(
    (i) => i.id === from.id || i.slug === from.slug,
  );
  if (!island) return false;

  const previousId = island.id;
  island.id = to.id;
  island.slug = to.slug;
  island.name = to.name;

  for (const place of store.places) {
    if (place.islandId === previousId) place.islandId = to.id;
  }
  return true;
}

const MIGRATIONS: Migration[] = [
  {
    id: "2026-08-rename-jawa-to-java",
    apply: (store) =>
      renameIsland(
        store,
        { id: "isl-jawa", slug: "jawa" },
        { id: "isl-java", slug: "java", name: "Java" },
      ),
  },
  {
    id: "2026-08-rename-sumatera-to-sumatra",
    apply: (store) =>
      renameIsland(
        store,
        { id: "isl-sumatera", slug: "sumatera" },
        { id: "isl-sumatra", slug: "sumatra", name: "Sumatra" },
      ),
  },
  {
    id: "2026-09-onboarding-collections",
    apply: (store) => {
      let changed = false;
      const s = store as DataStore & {
        invites?: DataStore["invites"];
        recoveryTokens?: DataStore["recoveryTokens"];
      };
      if (!Array.isArray(s.invites)) {
        s.invites = [];
        changed = true;
      }
      if (!Array.isArray(s.recoveryTokens)) {
        s.recoveryTokens = [];
        changed = true;
      }
      return changed;
    },
  },
  {
    id: "2026-09-admin-host-parents",
    apply: (store) => {
      let changed = false;

      const ensurePlace = (row: DataStore["places"][number]) => {
        const existing = store.places.find(
          (p) => p.id === row.id || (p.slug === row.slug && p.islandId === row.islandId),
        );
        if (existing) {
          if (existing.type !== row.type) {
            existing.type = row.type;
            changed = true;
          }
          if (!existing.summary && row.summary) {
            existing.summary = row.summary;
            changed = true;
          }
          return existing;
        }
        store.places.push(row);
        changed = true;
        return row;
      };

      const nest = (
        islandId: string,
        areaSlug: string,
        parentSlug: string,
      ) => {
        const parent = store.places.find(
          (p) => p.slug === parentSlug && p.islandId === islandId,
        );
        const area = store.places.find(
          (p) => p.slug === areaSlug && p.islandId === islandId,
        );
        if (!parent || !area) return;
        if (area.parentPlaceId !== parent.id) {
          area.parentPlaceId = parent.id;
          changed = true;
        }
        if (area.type !== "tourist_area") {
          area.type = "tourist_area";
          changed = true;
        }
      };

      const hasIsland = (id: string) => store.islands.some((i) => i.id === id);

      if (hasIsland("isl-bali")) {
        ensurePlace({
          id: "pl-badung",
          islandId: "isl-bali",
          slug: "badung",
          name: "Badung",
          type: "kabupaten",
          summary: "South Bali — surf coasts, Canggu, and the Bukit.",
        });
        ensurePlace({
          id: "pl-buleleng",
          islandId: "isl-bali",
          slug: "buleleng",
          name: "Buleleng",
          type: "kabupaten",
          summary: "North-coast Bali — Lovina and black-sand villages.",
        });
        ensurePlace({
          id: "pl-karangasem",
          islandId: "isl-bali",
          slug: "karangasem",
          name: "Karangasem",
          type: "kabupaten",
          summary: "East Bali — Amed, Agung, and traditional villages.",
        });
        nest("isl-bali", "ubud", "gianyar");
        nest("isl-bali", "uluwatu", "badung");
        nest("isl-bali", "jimbaran", "badung");
        nest("isl-bali", "canggu", "badung");
        nest("isl-bali", "seminyak", "badung");
        nest("isl-bali", "kuta", "badung");
        nest("isl-bali", "nusa-dua", "badung");
        nest("isl-bali", "sanur", "denpasar");
        nest("isl-bali", "lovina", "buleleng");
        nest("isl-bali", "amed", "karangasem");
      }

      if (hasIsland("isl-lombok")) {
        ensurePlace({
          id: "pl-lombok-utara",
          islandId: "isl-lombok",
          slug: "lombok-utara",
          name: "Lombok Utara",
          type: "kabupaten",
          summary: "North Lombok and the Gili islands.",
        });
        ensurePlace({
          id: "pl-lombok-tengah",
          islandId: "isl-lombok",
          slug: "lombok-tengah",
          name: "Lombok Tengah",
          type: "kabupaten",
          summary: "Central Lombok — Kuta and south-coast surf.",
        });
        nest("isl-lombok", "gili-trawangan", "lombok-utara");
        nest("isl-lombok", "kuta", "lombok-tengah");
      }

      return changed;
    },
  },
  {
    id: "2026-09-canonicalize-category-slugs",
    apply: (store) => {
      let changed = false;
      for (const business of store.businesses) {
        const next: string[] = [];
        const seen = new Set<string>();
        let rowChanged = false;
        for (const raw of business.categories) {
          const slug = canonicalizeCategory(raw);
          const value = slug ?? raw;
          if (value !== raw) rowChanged = true;
          if (seen.has(value)) {
            rowChanged = true;
            continue;
          }
          seen.add(value);
          next.push(value);
        }
        if (rowChanged) {
          business.categories = next;
          changed = true;
        }
      }
      return changed;
    },
  },
  {
    id: "2026-09-listing-facets",
    apply: (store) => {
      let changed = false;
      for (const business of store.businesses) {
        if (business.facets === undefined) {
          business.facets = {};
          changed = true;
        }
      }
      return changed;
    },
  },
  {
    id: "2026-09-listing-reports",
    apply: (store) => {
      const s = store as DataStore & { reports?: DataStore["reports"] };
      if (Array.isArray(s.reports)) return false;
      s.reports = [];
      return true;
    },
  },
  {
    id: "2026-09-listing-coords",
    apply: (store) => backfillListingCoords(store),
  },
  {
    id: "2026-09-indonesia-provinces",
    apply: (store) => {
      const { islands, places } = buildGeography();
      let changed = false;
      const staleIslandIds = new Set([
        "isl-lombok",
        "isl-java",
        "isl-sumatra",
        "isl-sulawesi",
        "isl-kalimantan",
      ]);

      for (const row of islands) {
        const existing = store.islands.find(
          (i) => i.id === row.id || i.slug === row.slug,
        );
        if (!existing) {
          store.islands.push({ ...row });
          changed = true;
          continue;
        }
        if (existing.id !== row.id) {
          for (const place of store.places) {
            if (place.islandId === existing.id) place.islandId = row.id;
          }
          existing.id = row.id;
          changed = true;
        }
        if (existing.slug !== row.slug) {
          existing.slug = row.slug;
          changed = true;
        }
        if (existing.name !== row.name) {
          existing.name = row.name;
          changed = true;
        }
        if (existing.tagline !== row.tagline) {
          existing.tagline = row.tagline;
          changed = true;
        }
        if (existing.status !== row.status) {
          existing.status = row.status;
          changed = true;
        }
        if (existing.kind !== row.kind) {
          existing.kind = row.kind;
          changed = true;
        }
        if (existing.region !== row.region) {
          existing.region = row.region;
          changed = true;
        }
      }

      for (const row of places) {
        const existing =
          store.places.find((p) => p.id === row.id) ||
          store.places.find(
            (p) => p.slug === row.slug && p.islandId === row.islandId,
          ) ||
          store.places.find(
            (p) => p.slug === row.slug && staleIslandIds.has(p.islandId),
          );
        if (!existing) {
          store.places.push({ ...row });
          changed = true;
          continue;
        }
        if (existing.id !== row.id) {
          existing.id = row.id;
          changed = true;
        }
        if (existing.islandId !== row.islandId) {
          existing.islandId = row.islandId;
          changed = true;
        }
        if (existing.slug !== row.slug) {
          existing.slug = row.slug;
          changed = true;
        }
        if (existing.name !== row.name) {
          existing.name = row.name;
          changed = true;
        }
        if (existing.type !== row.type) {
          existing.type = row.type;
          changed = true;
        }
        if (existing.parentPlaceId !== row.parentPlaceId) {
          existing.parentPlaceId = row.parentPlaceId;
          changed = true;
        }
        if (row.summary && existing.summary !== row.summary) {
          existing.summary = row.summary;
          changed = true;
        }
      }

      const keepIslandIds = new Set(islands.map((i) => i.id));
      const leftover = store.islands.filter(
        (i) => i.slug === "lombok" && i.id === "isl-lombok",
      );
      for (const island of leftover) {
        const remaining = store.places.some((p) => p.islandId === island.id);
        if (!remaining && !keepIslandIds.has(island.id)) {
          store.islands = store.islands.filter((i) => i.id !== island.id);
          changed = true;
        }
      }

      return changed;
    },
  },
];

/**
 * Apply every pending migration to `store`, in order.
 * Mutates `store`; returns the ids of the migrations that changed something.
 */
export function migrateStore(store: DataStore): string[] {
  const applied: string[] = [];
  for (const migration of MIGRATIONS) {
    if (migration.apply(store)) applied.push(migration.id);
  }
  return applied;
}
