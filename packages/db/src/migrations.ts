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
