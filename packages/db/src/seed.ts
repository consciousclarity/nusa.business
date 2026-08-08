import { hashStoredPasswords, resetSeed } from "./repository.js";

const store = resetSeed();
const hashed = await hashStoredPasswords();
console.log(
  `Seeded ${store.islands.length} islands, ${store.places.length} places, ${store.businesses.length} businesses, ${store.vendors.length} vendors.`,
);
console.log(`Hashed ${hashed} user password(s).`);
