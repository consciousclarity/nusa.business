import { allowDemoSeed, hashStoredPasswords, resetSeed } from "./repository.js";

if (process.env.NODE_ENV === "production" && !allowDemoSeed()) {
  console.error(
    "Refusing `npm run seed` in production without NUSA_ALLOW_DEMO_SEED=1.\n" +
      "Use NUSA_BOOTSTRAP_ADMIN_* for an empty geography store, or restore a backup.",
  );
  process.exit(1);
}

const store = resetSeed();
const hashed = await hashStoredPasswords();
console.log(
  `Seeded ${store.islands.length} islands, ${store.places.length} places, ${store.businesses.length} businesses, ${store.vendors.length} vendors.`,
);
console.log(`Hashed ${hashed} user password(s).`);
