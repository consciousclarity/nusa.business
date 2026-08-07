import { resetSeed } from "./repository.js";

const store = resetSeed();
console.log(
  `Seeded ${store.islands.length} islands, ${store.places.length} places, ${store.businesses.length} businesses, ${store.vendors.length} vendors.`,
);
