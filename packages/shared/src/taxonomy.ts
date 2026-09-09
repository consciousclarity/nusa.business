/**
 * Indonesia-first two-level directory taxonomy.
 *
 * Listings store canonical slugs. Groups are browse/filter buckets; leaves are
 * the usual assignable types. Related entries point at leaves owned by another
 * group so Events & Weddings can surface catering, photography, makeup,
 * florists, and cakes without duplicating those records.
 */

export type TaxonomyLeaf = {
  slug: string;
  label: string;
};

export type TaxonomyRelated = {
  /** Canonical leaf slug owned by another group. */
  slug: string;
  /** How this group names the related service (never a second record). */
  as: string;
};

export type TaxonomyGroup = {
  slug: string;
  label: string;
  children: TaxonomyLeaf[];
  related?: TaxonomyRelated[];
};

export type CategoryRecord = {
  slug: string;
  label: string;
  kind: "group" | "leaf";
  groupSlug: string;
};

export type RelatedCategory = TaxonomyRelated & {
  label: string;
  groupSlug: string;
  groupLabel: string;
};

export type TaxonomyCatalogGroup = {
  slug: string;
  label: string;
  children: TaxonomyLeaf[];
  related: RelatedCategory[];
};

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['\u2018\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/** Same as public `toSlug` — apostrophes become hyphens. Indexed as lookup aliases. */
function slugifyHyphenApos(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function leaves(...labels: string[]): TaxonomyLeaf[] {
  return labels.map((label) => ({ slug: slugify(label), label }));
}

function group(
  label: string,
  children: string[],
  related?: TaxonomyRelated[],
): TaxonomyGroup {
  return {
    slug: slugify(label),
    label,
    children: leaves(...children),
    ...(related && related.length ? { related } : {}),
  };
}

/** Flat 10-bucket MVP labels → new group slugs. */
const LEGACY_CATEGORY_ALIASES: Record<string, string> = {
  accommodation: "hotels-accommodation",
  "health-wellness": "health-medical",
  "tourism-experiences": "travel-experiences",
  "arts-culture": "creative-media",
  "professional-services": "business-professional-services",
  "sports-recreation": "travel-experiences",
  "beauty-personal-care": "beauty-spa-fitness",
  "home-construction": "property-construction",
};

export const TAXONOMY: TaxonomyGroup[] = [
  group("Food & Drink", [
    "Restaurants",
    "Warungs & Local Food",
    "Cafés & Coffee Shops",
    "Bakeries & Cake Shops",
    "Bars & Pubs",
    "Beach Clubs",
    "Catering Services",
    "Fast Food & Takeaway",
    "Food Stalls & Street Food",
    "Seafood Restaurants",
    "Vegetarian & Vegan Dining",
    "Dessert & Ice Cream Shops",
  ]),
  group("Hotels & Accommodation", [
    "Hotels",
    "Resorts",
    "Villas",
    "Guesthouses & Homestays",
    "Hostels",
    "Bungalows & Cottages",
    "Apartments & Serviced Residences",
    "Vacation Rentals",
    "Kos & Long-Term Rentals",
    "Camping & Glamping",
  ]),
  group("Travel & Experiences", [
    "Travel Agencies",
    "Tour Operators & Local Guides",
    "Tourist Attractions",
    "Cultural Experiences",
    "Diving & Snorkeling",
    "Surf Schools & Rentals",
    "Boat Charters & Island Transfers",
    "Water Sports",
    "Hiking & Adventure Tours",
    "Retreats & Wellness Experiences",
  ]),
  group("Transport & Automotive", [
    "Car Rentals",
    "Motorcycle & Scooter Rentals",
    "Taxis & Private Drivers",
    "Airport Transfers & Shuttles",
    "Car Repair Shops",
    "Motorcycle Repair Shops",
    "Car & Motorcycle Washes",
    "Tires, Batteries & Spare Parts",
    "Towing & Roadside Assistance",
    "Automotive AC Services",
    "Fuel Stations & EV Charging",
  ]),
  group("Health & Medical", [
    "Clinics & Hospitals",
    "Pharmacies",
    "Dentists & Dental Clinics",
    "Eye Clinics & Opticians",
    "Medical Laboratories",
    "Physiotherapy & Rehabilitation",
    "Mental Health & Counseling",
    "Maternity & Women's Health",
    "Home Nursing & Elder Care",
    "Traditional & Holistic Medicine",
  ]),
  group("Beauty, Spa & Fitness", [
    "Beauty & Aesthetic Clinics",
    "Hair Salons & Barbers",
    "Spas & Massage",
    "Nail, Lash & Brow Studios",
    "Gyms & Fitness Centers",
    "Yoga & Pilates Studios",
    "Personal Trainers",
    "Wellness Centers & Saunas",
    "Tattoo & Piercing Studios",
    "Nutrition & Wellness Coaching",
  ]),
  group("Home Services", [
    "AC Installation & Repair",
    "Home Cleaning Services",
    "Laundry & Dry Cleaning",
    "Handyman Services",
    "Plumbing Services",
    "Electrical Services",
    "Appliance Repair",
    "Pest Control",
    "Septic Tank Cleaning",
    "Moving Services",
    "Gardening & Landscaping",
    "Pool Maintenance",
    "Security & CCTV Installation",
    "Waste Removal & Recycling",
  ]),
  group("Property & Construction", [
    "Real Estate Agents",
    "Property Developers",
    "Property Management",
    "Building Contractors",
    "Renovation Services",
    "Architects",
    "Interior Designers",
    "Surveyors & Engineering Services",
    "Building Materials Stores",
    "Hardware & Tool Stores",
    "Furniture & Home Décor",
    "Solar & Renewable Energy Services",
  ]),
  group("Business & Professional Services", [
    "Accounting & Bookkeeping",
    "Tax Consultants",
    "Business Consultants",
    "Company Formation & Licensing",
    "Immigration & Visa Services",
    "HR & Recruitment",
    "Coworking Spaces",
    "Translation & Interpreting",
    "Marketing & Advertising Agencies",
    "Copy & Print Shops",
    "Office Supplies",
    "Business Security Services",
  ]),
  group("Legal & Financial Services", [
    "Law Firms & Legal Services",
    "Notaries & PPAT",
    "Banks & ATMs",
    "Money Changers",
    "Insurance Services",
    "Loans & Financing",
    "Financial Advisors",
    "Payment & POS Services",
    "Investment & Wealth Services",
  ]),
  group("Shopping & Retail", [
    "Supermarkets & Grocery Stores",
    "Convenience Stores",
    "Traditional Markets",
    "Fashion & Clothing",
    "Jewelry & Accessories",
    "Souvenirs & Handicrafts",
    "Electronics & Appliances",
    "Mobile Phones & Accessories",
    "Beauty & Cosmetics",
    "Baby & Children's Stores",
    "Sports & Outdoor Stores",
    "Books & Stationery",
    "Florists & Plant Shops",
  ]),
  group("Technology & Repair", [
    "Phone & Device Repair",
    "Computer & Laptop Repair",
    "Electronics Repair",
    "IT Support",
    "Internet & Network Installation",
    "Data Recovery",
    "Cybersecurity Services",
    "Web & App Development",
    "Software & Digital Services",
    "Smart Home Installation",
  ]),
  group("Creative & Media", [
    "Photography Studios",
    "Commercial Photography",
    "Video Production",
    "Drone Photography",
    "Graphic Design & Branding",
    "Content & Social Media Services",
    "Printing & Signage",
    "Audio & Recording Studios",
    "Media & Publishing",
    "Advertising Production",
  ]),
  group("Education & Childcare", [
    "Preschools & Daycare",
    "Primary & Secondary Schools",
    "Universities & Colleges",
    "Tutoring & Learning Centers",
    "Language Schools",
    "Vocational & Skills Training",
    "Music, Dance & Art Schools",
    "Driving Schools",
    "Special Needs Education",
    "Online Courses & Training",
  ]),
  group(
    "Events & Weddings",
    [
      "Wedding Planners",
      "Event Organizers",
      "Wedding & Event Venues",
      "Event Decorators",
      "Bridal Wear",
      "DJs, Bands & Entertainers",
      "Party Equipment Rental",
      "Invitations & Event Souvenirs",
      "Ceremony & Officiant Services",
      "Event Staffing",
    ],
    [
      { slug: "catering-services", as: "Catering" },
      { slug: "photography-studios", as: "Photography" },
      { slug: "beauty-aesthetic-clinics", as: "Makeup" },
      { slug: "florists-plant-shops", as: "Florists" },
      { slug: "bakeries-cake-shops", as: "Cakes" },
    ],
  ),
  group("Pets & Animals", [
    "Veterinary Clinics",
    "Pet Grooming",
    "Pet Boarding & Hotels",
    "Pet Sitting & Dog Walking",
    "Pet Stores & Supplies",
    "Pet Training",
    "Animal Rescue & Adoption",
    "Livestock & Animal Services",
  ]),
  group("Logistics & Delivery", [
    "Courier & Parcel Delivery",
    "Local Delivery Services",
    "Cargo & Freight",
    "Warehousing & Storage",
    "Fulfillment Services",
    "Shipping & Customs Agents",
    "Postal Services",
    "Refrigerated & Cold-Chain Delivery",
  ]),
];

const byKey = new Map<string, CategoryRecord>();
const bySlug = new Map<string, CategoryRecord>();

function indexRecord(rec: CategoryRecord, extraKeys: string[] = []) {
  bySlug.set(rec.slug, rec);
  byKey.set(rec.slug, rec);
  byKey.set(slugify(rec.label), rec);
  byKey.set(slugifyHyphenApos(rec.label), rec);
  for (const k of extraKeys) byKey.set(k, rec);
}

for (const g of TAXONOMY) {
  indexRecord({
    slug: g.slug,
    label: g.label,
    kind: "group",
    groupSlug: g.slug,
  });
  for (const child of g.children) {
    indexRecord({
      slug: child.slug,
      label: child.label,
      kind: "leaf",
      groupSlug: g.slug,
    });
  }
}

for (const [from, to] of Object.entries(LEGACY_CATEGORY_ALIASES)) {
  const rec = bySlug.get(to);
  if (rec) byKey.set(from, rec);
}


/**
 * Assignable English labels (groups + leaves). Prefer `TAXONOMY` and
 * `canonicalizeCategory` for new code. Kept so older callers can list names.
 */
export const CATEGORIES: readonly string[] = TAXONOMY.flatMap((g) => [
  g.label,
  ...g.children.map((c) => c.label),
]);

export type Category = string;

/** Resolve a slug, English label, or legacy MVP label to a canonical slug. */
export function canonicalizeCategory(input: string): string | undefined {
  const raw = input.trim();
  if (!raw) return undefined;
  return byKey.get(slugify(raw))?.slug;
}

export function isKnownCategory(input: string): boolean {
  return canonicalizeCategory(input) !== undefined;
}

export function categoryLabel(input: string): string {
  const slug = canonicalizeCategory(input);
  if (!slug) return input;
  return bySlug.get(slug)?.label ?? input;
}

export function categoryLabels(inputs: readonly string[]): string[] {
  return inputs.map(categoryLabel);
}

export function categoryRecord(input: string): CategoryRecord | undefined {
  const slug = canonicalizeCategory(input);
  return slug ? bySlug.get(slug) : undefined;
}

function relatedOf(groupNode: TaxonomyGroup): RelatedCategory[] {
  return (groupNode.related ?? []).map((rel) => {
    const rec = bySlug.get(rel.slug);
    if (!rec) {
      throw new Error(`Related category slug is not in the taxonomy: ${rel.slug}`);
    }
    const parent = bySlug.get(rec.groupSlug);
    return {
      slug: rel.slug,
      as: rel.as,
      label: rec.label,
      groupSlug: rec.groupSlug,
      groupLabel: parent?.label ?? rec.groupSlug,
    };
  });
}

/** Slugs that match a category query: the node, its children, and related leaves. */
export function expandCategoryFilter(query: string): Set<string> {
  const slug = canonicalizeCategory(query);
  if (!slug) return new Set();
  const rec = bySlug.get(slug);
  const out = new Set<string>([slug]);
  if (rec?.kind !== "group") return out;
  const groupNode = TAXONOMY.find((g) => g.slug === slug);
  if (!groupNode) return out;
  for (const child of groupNode.children) out.add(child.slug);
  for (const rel of groupNode.related ?? []) out.add(rel.slug);
  return out;
}

export function listingMatchesCategory(
  listingCategories: readonly string[],
  query: string,
): boolean {
  const expanded = expandCategoryFilter(query);
  if (!expanded.size) return false;
  for (const raw of listingCategories) {
    const slug = canonicalizeCategory(raw);
    if (slug && expanded.has(slug)) return true;
  }
  return false;
}

/** Unique group + leaf options derived from listing tags, groups first. */
export function categoryFilterOptions(listingCategories: readonly string[]): {
  slug: string;
  label: string;
  kind: "group" | "leaf";
}[] {
  const slugs = new Set<string>();
  for (const raw of listingCategories) {
    const slug = canonicalizeCategory(raw);
    if (!slug) continue;
    slugs.add(slug);
    const rec = bySlug.get(slug);
    if (rec?.kind === "leaf") slugs.add(rec.groupSlug);
  }
  return [...slugs]
    .map((slug) => {
      const rec = bySlug.get(slug)!;
      return { slug, label: rec.label, kind: rec.kind };
    })
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "group" ? -1 : 1;
      return a.label.localeCompare(b.label);
    });
}

/** Related services when browsing a group that declares them (not for a leaf). */
export function relatedForCategory(query: string): RelatedCategory[] {
  const rec = categoryRecord(query);
  if (!rec || rec.kind !== "group") return [];
  const groupNode = TAXONOMY.find((g) => g.slug === rec.slug);
  return groupNode ? relatedOf(groupNode) : [];
}

export function taxonomyCatalog(): TaxonomyCatalogGroup[] {
  return TAXONOMY.map((g) => ({
    slug: g.slug,
    label: g.label,
    children: g.children,
    related: relatedOf(g),
  }));
}

/** Deduped canonical slugs; unknown values return an error string. */
export function canonicalizeCategoryList(
  inputs: readonly string[],
): { ok: true; value: string[] } | { ok: false; error: string } {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of inputs) {
    const slug = canonicalizeCategory(raw);
    if (!slug) {
      return { ok: false, error: `categories contains unknown value: ${String(raw)}` };
    }
    if (!seen.has(slug)) {
      seen.add(slug);
      out.push(slug);
    }
  }
  return { ok: true, value: out };
}
