/**
 * Directory facets: global filters plus per-group extras.
 *
 * Listings store `facets: Record<facetKey, valueSlugs[]>`. Geo `location` is
 * the nested host, not a stored facet. Distance / open-now / rating /
 * claimed-listing are computed at query time.
 */

import { categoryRecord } from "./taxonomy.js";

export type FacetSource = "stored" | "computed" | "geo";

export type FacetValue = { slug: string; label: string };

export type FacetDef = {
  key: string;
  label: string;
  source: FacetSource;
  values: FacetValue[];
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

function vals(...labels: string[]): FacetValue[] {
  return labels.map((label) => ({ slug: slugify(label), label }));
}

function pairs(...rows: [string, string][]): FacetValue[] {
  return rows.map(([slug, label]) => ({ slug, label }));
}

function facet(
  key: string,
  label: string,
  values: FacetValue[],
  source: FacetSource = "stored",
): FacetDef {
  return { key, label, values, source };
}

/** Global filters available on every category browse. */
export const GLOBAL_FACETS: FacetDef[] = [
  facet(
    "location",
    "Location",
    vals(
      "Island",
      "Province",
      "Regency",
      "City",
      "District",
      "Village",
    ),
    "geo",
  ),
  facet(
    "distance",
    "Distance",
    pairs(
      ["1km", "Within 1 km"],
      ["5km", "Within 5 km"],
      ["10km", "Within 10 km"],
      ["25km", "Within 25 km"],
      ["50km", "Within 50 km"],
    ),
    "computed",
  ),
  facet(
    "availability",
    "Availability",
    vals("Open now", "Open late", "24 hours", "Weekends", "Public holidays"),
    "computed",
  ),
  facet(
    "service_mode",
    "Service mode",
    vals(
      "At location",
      "Home visit",
      "Pickup",
      "Delivery",
      "Online",
      "Mobile service",
    ),
  ),
  facet(
    "booking",
    "Booking",
    vals(
      "Walk-ins",
      "Appointment required",
      "Online booking",
      "Same-day booking",
    ),
  ),
  facet(
    "price_level",
    "Price level",
    vals("Budget", "Moderate", "Premium", "Luxury"),
  ),
  facet(
    "rating",
    "Rating",
    pairs(["3-plus", "3+"], ["4-plus", "4+"], ["4-5-plus", "4.5+"]),
    "computed",
  ),
  facet(
    "verification",
    "Verification",
    vals("Verified business", "Verified address", "Claimed listing"),
    "computed",
  ),
  facet(
    "payments",
    "Payments",
    vals("Cash", "Cards", "Bank transfer", "QRIS", "E-wallet", "Installments"),
  ),
  facet(
    "languages",
    "Languages",
    vals("Indonesian", "English", "Balinese", "Mandarin", "Japanese", "Other"),
  ),
  facet(
    "accessibility",
    "Accessibility",
    vals("Wheelchair entrance", "Accessible toilet", "Accessible parking"),
  ),
  facet(
    "audience",
    "Audience",
    vals("Family-friendly", "Child-friendly", "Women-friendly", "Pet-friendly"),
  ),
  facet(
    "parking",
    "Parking",
    vals("Car parking", "Motorcycle parking", "Valet", "Street parking"),
  ),
  facet(
    "amenities",
    "Amenities",
    vals("Wi-Fi", "Air conditioning", "Toilet", "Prayer room", "Waiting area"),
  ),
  facet(
    "business_features",
    "Business features",
    vals("Locally owned", "Women-owned", "Sustainable", "Plastic-free"),
  ),
  facet(
    "promotions",
    "Promotions",
    vals("Discounts", "Packages", "Loyalty program", "Free consultation"),
  ),
];

const GROUP_FACETS: Record<string, FacetDef[]> = {
  "food-drink": [
    facet(
      "cuisine",
      "Cuisine",
      vals(
        "Balinese",
        "Indonesian",
        "Javanese",
        "Asian",
        "Western",
        "Italian",
        "Japanese",
        "Chinese",
        "Indian",
        "Middle Eastern",
        "Mexican",
        "Fusion",
      ),
    ),
    facet(
      "dietary",
      "Dietary",
      vals("Halal", "Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Organic"),
    ),
    facet(
      "meal",
      "Meal",
      vals("Breakfast", "Brunch", "Lunch", "Dinner", "Late-night"),
    ),
    facet(
      "dining_service",
      "Dining service",
      vals("Dine-in", "Takeaway", "Delivery", "Reservations", "Buffet"),
    ),
    facet(
      "setting",
      "Setting",
      vals("Beachfront", "Rooftop", "Garden", "Poolside", "Indoor", "Outdoor"),
    ),
    facet(
      "features",
      "Features",
      vals("Live music", "Ocean view", "Coworking-friendly", "Romantic", "Family-friendly"),
    ),
    facet(
      "food_type",
      "Food type",
      vals("Seafood", "Barbecue", "Healthy food", "Street food", "Desserts", "Coffee"),
    ),
    facet(
      "alcohol",
      "Alcohol",
      vals("No alcohol", "Beer and wine", "Cocktails", "Full bar"),
    ),
  ],
  "hotels-accommodation": [
    facet(
      "property_type",
      "Property type",
      vals(
        "Hotel",
        "Resort",
        "Villa",
        "Hostel",
        "Guesthouse",
        "Homestay",
        "Apartment",
        "Kos",
        "Glamping",
      ),
    ),
    facet(
      "star_rating",
      "Star rating",
      pairs(
        ["1", "1 star"],
        ["2", "2 stars"],
        ["3", "3 stars"],
        ["4", "4 stars"],
        ["5", "5 stars"],
        ["unrated", "Unrated"],
      ),
    ),
    facet(
      "nightly_price",
      "Nightly price",
      pairs(
        ["under-500k", "Under Rp 500k"],
        ["500k-1-5m", "Rp 500k–1.5m"],
        ["1-5m-3m", "Rp 1.5m–3m"],
        ["3m-plus", "Rp 3m+"],
      ),
    ),
    facet(
      "room_type",
      "Room type",
      vals("Private room", "Shared room", "Suite", "Family room", "Entire property"),
    ),
    facet(
      "facilities",
      "Facilities",
      vals("Pool", "Restaurant", "Gym", "Spa", "Coworking space", "Kitchen", "Laundry"),
    ),
    facet(
      "location_feature",
      "Location feature",
      vals("Beachfront", "Ocean view", "City center", "Rural", "Near airport"),
    ),
    facet(
      "meal_plan",
      "Meal plan",
      vals("Breakfast included", "Half-board", "Full-board", "Self-catering"),
    ),
    facet(
      "policies",
      "Policies",
      vals("Free cancellation", "Pay at property", "Long stays", "Children allowed", "Pets allowed"),
    ),
    facet(
      "transport",
      "Transport",
      vals("Airport transfer", "Shuttle", "Scooter rental", "Car rental"),
    ),
    facet(
      "stay_features",
      "Stay features",
      vals("Monthly rates", "Day-use rooms", "Private pool", "Connecting rooms"),
    ),
  ],
  "travel-experiences": [
    facet(
      "activity",
      "Activity",
      vals(
        "Cultural",
        "Adventure",
        "Diving",
        "Snorkeling",
        "Surfing",
        "Hiking",
        "Boating",
        "Wellness",
      ),
    ),
    facet(
      "duration",
      "Duration",
      vals("Under 2 hours", "Half-day", "Full-day", "Multi-day"),
    ),
    facet("format", "Format", vals("Private", "Small group", "Large group", "Self-guided")),
    facet("difficulty", "Difficulty", vals("Easy", "Moderate", "Challenging", "Expert")),
    facet("skill_level", "Skill level", vals("Beginner", "Intermediate", "Advanced")),
    facet(
      "included",
      "Included",
      vals("Transport", "Guide", "Meals", "Equipment", "Entrance fees", "Insurance"),
    ),
    facet("pickup", "Pickup", vals("Hotel pickup", "Meeting point", "Airport pickup")),
    facet(
      "audience",
      "Audience",
      vals("Children", "Families", "Couples", "Seniors", "Corporate groups"),
    ),
    facet(
      "certification",
      "Certification",
      vals("PADI", "SSI", "Licensed guide", "First-aid certified"),
    ),
    facet(
      "booking",
      "Booking",
      vals("Instant confirmation", "Same-day booking", "Free cancellation"),
    ),
  ],
  "transport-automotive": [
    facet(
      "vehicle_type",
      "Vehicle type",
      vals("Car", "Motorcycle", "Scooter", "Van", "Minibus", "Truck", "Electric vehicle"),
    ),
    facet(
      "rental_type",
      "Rental type",
      vals("Self-drive", "With driver", "Daily", "Weekly", "Monthly"),
    ),
    facet("transmission", "Transmission", vals("Automatic", "Manual")),
    facet(
      "rental_features",
      "Rental features",
      vals("Insurance included", "Unlimited mileage", "Vehicle delivery", "Helmet included"),
    ),
    facet(
      "repair_service",
      "Repair service",
      vals("Engine", "Brakes", "Electrical", "Bodywork", "Tires", "Battery", "AC"),
    ),
    facet("parts", "Parts", vals("Original", "Aftermarket", "Used", "Special order")),
    facet(
      "response",
      "Response",
      vals("Emergency service", "Roadside assistance", "Same-day repair"),
    ),
    facet(
      "workshop_type",
      "Workshop type",
      vals("Authorized dealer", "Independent workshop", "Mobile mechanic"),
    ),
    facet("fuel_type", "Fuel type", vals("Petrol", "Diesel", "Electric", "Hybrid")),
    facet(
      "transport_route",
      "Transport route",
      vals("Airport", "Intercity", "Local", "Island transfer"),
    ),
  ],
  "health-medical": [
    facet(
      "specialty",
      "Specialty",
      vals(
        "General practice",
        "Dental",
        "Eye care",
        "Pediatrics",
        "Physiotherapy",
        "Mental health",
        "Maternity",
      ),
    ),
    facet(
      "patient_type",
      "Patient type",
      vals("Adults", "Children", "Seniors", "Women", "International patients"),
    ),
    facet("care_mode", "Care mode", vals("In-clinic", "Home visit", "Telemedicine", "Emergency")),
    facet(
      "appointment",
      "Appointment",
      vals("Walk-in", "Appointment", "Same-day", "Online consultation"),
    ),
    facet(
      "insurance",
      "Insurance",
      vals("BPJS", "Private insurance", "International insurance", "Self-pay"),
    ),
    facet(
      "diagnostics",
      "Diagnostics",
      vals("Laboratory", "X-ray", "Ultrasound", "Medical checkup"),
    ),
    facet(
      "provider_preference",
      "Provider preference",
      vals("Female practitioner", "Male practitioner"),
    ),
    facet(
      "facility",
      "Facility",
      vals("Pharmacy", "Inpatient care", "Emergency room", "Ambulance"),
    ),
    facet(
      "hours",
      "Hours",
      vals("24-hour pharmacy", "24-hour clinic", "After-hours doctor"),
    ),
    facet(
      "certification",
      "Certification",
      vals("Licensed practitioner", "Accredited facility"),
    ),
  ],
  "beauty-spa-fitness": [
    facet(
      "service",
      "Service",
      vals("Hair", "Barbering", "Nails", "Lashes", "Skincare", "Massage", "Aesthetics", "Tattoo"),
    ),
    facet(
      "fitness_type",
      "Fitness type",
      vals("Gym", "Yoga", "Pilates", "CrossFit", "Martial arts", "Personal training"),
    ),
    facet(
      "treatment_style",
      "Treatment style",
      vals("Traditional Balinese", "Therapeutic", "Medical", "Organic", "Luxury"),
    ),
    facet("audience", "Audience", vals("Women", "Men", "Unisex", "Children")),
    facet(
      "service_mode",
      "Service mode",
      vals("Studio", "Home service", "Hotel service", "Outdoor class"),
    ),
    facet("booking", "Booking", vals("Walk-in", "Appointment", "Online booking")),
    facet("session_type", "Session type", vals("Private", "Group", "Couples")),
    facet(
      "membership",
      "Membership",
      vals("Drop-in", "Day pass", "Weekly", "Monthly", "Annual"),
    ),
    facet(
      "facilities",
      "Facilities",
      vals("Shower", "Sauna", "Pool", "Changing room", "Equipment rental"),
    ),
    facet(
      "practitioner",
      "Practitioner",
      vals("Certified trainer", "Licensed therapist", "Medical practitioner"),
    ),
  ],
  "home-services": [
    facet(
      "service",
      "Service",
      vals(
        "AC",
        "Cleaning",
        "Plumbing",
        "Electrical",
        "Laundry",
        "Pest control",
        "Moving",
        "Landscaping",
      ),
    ),
    facet(
      "property_type",
      "Property type",
      vals("House", "Villa", "Apartment", "Hotel", "Restaurant", "Commercial property"),
    ),
    facet("urgency", "Urgency", vals("Scheduled", "Same-day", "Emergency 24-hour")),
    facet(
      "service_mode",
      "Service mode",
      vals("On-site", "Pickup and delivery", "Remote assessment"),
    ),
    facet(
      "pricing",
      "Pricing",
      vals("Free estimate", "Fixed price", "Hourly rate", "Inspection fee"),
    ),
    facet("frequency", "Frequency", vals("One-time", "Weekly", "Monthly", "Contract")),
    facet("materials", "Materials", vals("Included", "Customer supplied", "Optional")),
    facet("warranty", "Warranty", vals("Service warranty", "Parts warranty")),
    facet(
      "specialization",
      "Specialization",
      vals("Pool", "Septic system", "Solar", "Appliances", "Security systems"),
    ),
    facet(
      "eco_options",
      "Eco options",
      vals("Non-toxic products", "Eco-friendly cleaning", "Waste recycling"),
    ),
  ],
  "property-construction": [
    facet(
      "service",
      "Service",
      vals("Sale", "Rental", "Construction", "Renovation", "Design", "Management"),
    ),
    facet(
      "property_type",
      "Property type",
      vals("Land", "House", "Villa", "Apartment", "Hotel", "Office", "Retail", "Warehouse"),
    ),
    facet(
      "transaction",
      "Transaction",
      vals("For sale", "Short-term rent", "Long-term rent", "Leasehold", "Freehold"),
    ),
    facet(
      "project_type",
      "Project type",
      vals("Residential", "Hospitality", "Retail", "Commercial", "Industrial"),
    ),
    facet(
      "construction_stage",
      "Construction stage",
      vals("Planning", "Design", "Building", "Renovation", "Completed"),
    ),
    facet(
      "property_features",
      "Property features",
      vals("Pool", "Garden", "Parking", "Furnished", "Beachfront", "Ocean view"),
    ),
    facet(
      "bedrooms",
      "Bedrooms",
      pairs(
        ["studio", "Studio"],
        ["1", "1"],
        ["2", "2"],
        ["3", "3"],
        ["4-plus", "4+"],
      ),
    ),
    facet(
      "land_area",
      "Land area",
      pairs(
        ["under-1-are", "Under 1 are"],
        ["1-5-are", "1–5 are"],
        ["5-plus-are", "5+ are"],
      ),
    ),
    facet(
      "building_area",
      "Building area",
      pairs(
        ["under-50m2", "Under 50 m²"],
        ["50-150m2", "50–150 m²"],
        ["150-plus-m2", "150 m²+"],
      ),
    ),
    facet(
      "professional_type",
      "Professional type",
      vals("Architect", "Contractor", "Engineer", "Surveyor", "Interior designer"),
    ),
    facet("credentials", "Credentials", vals("Licensed", "Insured", "Association member")),
    facet("materials", "Materials", vals("Local", "Imported", "Sustainable", "Custom-made")),
  ],
  "business-professional-services": [
    facet(
      "service",
      "Service",
      vals(
        "Accounting",
        "Tax",
        "Consulting",
        "Licensing",
        "Recruitment",
        "Translation",
        "Marketing",
      ),
    ),
    facet(
      "client_type",
      "Client type",
      vals("Individual", "Startup", "SME", "Enterprise", "Nonprofit"),
    ),
    facet(
      "industry",
      "Industry",
      vals("Hospitality", "Tourism", "Retail", "Construction", "Technology", "Healthcare"),
    ),
    facet(
      "engagement",
      "Engagement",
      vals("One-time", "Project-based", "Monthly retainer", "Outsourced"),
    ),
    facet("delivery", "Delivery", vals("On-site", "Remote", "Hybrid")),
    facet(
      "pricing",
      "Pricing",
      vals("Hourly", "Fixed project", "Subscription", "Free consultation"),
    ),
    facet(
      "company_stage",
      "Company stage",
      vals("New business", "Growing business", "Established business"),
    ),
    facet(
      "specialization",
      "Specialization",
      vals("Foreign-owned company", "Local company", "PT PMA", "Permits", "Visas"),
    ),
    facet("credentials", "Credentials", vals("Certified", "Licensed", "Association member")),
    facet("response_time", "Response time", vals("Same-day", "Within 24 hours", "Scheduled")),
  ],
  "legal-financial-services": [
    facet(
      "service",
      "Service",
      vals(
        "Legal advice",
        "Notary",
        "Property law",
        "Company law",
        "Banking",
        "Insurance",
        "Financing",
      ),
    ),
    facet(
      "client_type",
      "Client type",
      vals("Individual", "Family", "Local business", "Foreign investor", "Corporation"),
    ),
    facet(
      "legal_specialty",
      "Legal specialty",
      vals("Property", "Immigration", "Employment", "Criminal", "Family", "Commercial"),
    ),
    facet(
      "financial_product",
      "Financial product",
      vals("Bank account", "Loan", "Insurance", "Investment", "Payment processing"),
    ),
    facet("service_mode", "Service mode", vals("In-person", "Online", "Mobile service")),
    facet("appointment", "Appointment", vals("Walk-in", "Appointment", "Consultation")),
    facet(
      "credentials",
      "Credentials",
      vals("Licensed advocate", "Notary", "PPAT", "Regulated financial provider"),
    ),
    facet("currency", "Currency", vals("IDR", "USD", "EUR", "AUD", "SGD", "Other")),
    facet(
      "facility",
      "Facility",
      vals("ATM", "Cash deposit", "Foreign exchange", "International transfer"),
    ),
    facet(
      "availability",
      "Availability",
      vals("24-hour ATM", "Weekend service", "Emergency legal support"),
    ),
  ],
  "shopping-retail": [
    facet(
      "product_type",
      "Product type",
      vals("Grocery", "Fashion", "Electronics", "Beauty", "Jewelry", "Handicrafts", "Books"),
    ),
    facet(
      "shopping_mode",
      "Shopping mode",
      vals("In-store", "Online", "Delivery", "Click and collect"),
    ),
    facet(
      "origin",
      "Origin",
      vals("Locally made", "Indonesian brands", "Imported", "Handmade"),
    ),
    facet("customer_type", "Customer type", vals("Retail", "Wholesale", "Trade")),
    facet("price_level", "Price level", vals("Budget", "Mid-range", "Premium", "Luxury")),
    facet("payments", "Payment", vals("Cash", "Cards", "QRIS", "Installments")),
    facet(
      "delivery",
      "Delivery",
      vals("Local delivery", "Nationwide delivery", "International shipping"),
    ),
    facet("returns", "Returns", vals("Returns accepted", "Exchange only", "Final sale")),
    facet("warranty", "Warranty", vals("Manufacturer warranty", "Store warranty")),
    facet(
      "features",
      "Features",
      vals("Custom orders", "Gift wrapping", "Tax-free shopping"),
    ),
    facet(
      "sustainability",
      "Sustainability",
      vals("Refillable", "Recycled", "Plastic-free", "Fair trade"),
    ),
  ],
  "technology-repair": [
    facet(
      "device",
      "Device",
      vals(
        "Smartphone",
        "Tablet",
        "Laptop",
        "Desktop",
        "Television",
        "Camera",
        "Networking equipment",
      ),
    ),
    facet(
      "brand",
      "Brand",
      vals("Apple", "Samsung", "Xiaomi", "Oppo", "Vivo", "Asus", "Acer", "Lenovo", "Other"),
    ),
    facet(
      "service",
      "Service",
      vals(
        "Screen repair",
        "Battery replacement",
        "Diagnostics",
        "Data recovery",
        "Software repair",
      ),
    ),
    facet(
      "support_type",
      "Support type",
      vals("Walk-in", "On-site", "Remote", "Pickup and delivery"),
    ),
    facet(
      "turnaround",
      "Turnaround",
      vals("While you wait", "Same-day", "1–3 days", "Special order"),
    ),
    facet("parts", "Parts", vals("Original", "OEM-compatible", "Refurbished")),
    facet("warranty", "Warranty", vals("Repair warranty", "Parts warranty")),
    facet(
      "business_service",
      "Business service",
      vals("IT support", "Networking", "Cybersecurity", "Cloud services"),
    ),
    facet(
      "development",
      "Development",
      vals("Website", "E-commerce", "Mobile app", "Custom software"),
    ),
    facet("emergency", "Emergency", vals("After-hours IT support", "Urgent data recovery")),
  ],
  "creative-media": [
    facet(
      "service",
      "Service",
      vals(
        "Photography",
        "Video",
        "Drone",
        "Branding",
        "Graphic design",
        "Audio",
        "Content production",
      ),
    ),
    facet(
      "specialty",
      "Specialty",
      vals("Commercial", "Product", "Property", "Food", "Fashion", "Portrait", "Wedding"),
    ),
    facet("location", "Location", vals("Studio", "Client location", "Outdoor", "Destination")),
    facet(
      "deliverable",
      "Deliverable",
      vals("Digital files", "Prints", "Edited video", "Raw footage", "Social media content"),
    ),
    facet(
      "style",
      "Style",
      vals("Documentary", "Cinematic", "Editorial", "Lifestyle", "Traditional"),
    ),
    facet("turnaround", "Turnaround", vals("Same-day", "Under one week", "1–4 weeks")),
    facet(
      "production",
      "Production",
      vals("Pre-production", "Shooting", "Editing", "Full production"),
    ),
    facet(
      "equipment",
      "Equipment",
      vals("Studio lighting", "Drone", "Underwater camera", "Audio recording"),
    ),
    facet(
      "licensing",
      "Licensing",
      vals("Personal use", "Commercial use", "Full usage rights"),
    ),
    facet("package", "Package", vals("Hourly", "Half-day", "Full-day", "Project package")),
  ],
  "education-childcare": [
    facet(
      "education_level",
      "Education level",
      vals("Preschool", "Primary", "Secondary", "University", "Vocational", "Adult learning"),
    ),
    facet(
      "subject",
      "Subject",
      vals("Languages", "Mathematics", "Science", "Technology", "Business", "Arts", "Music"),
    ),
    facet("age_group", "Age group", vals("Infants", "Toddlers", "Children", "Teenagers", "Adults")),
    facet("format", "Format", vals("In-person", "Online", "Hybrid", "Private", "Group")),
    facet("schedule", "Schedule", vals("Weekdays", "Weekends", "Evenings", "Intensive")),
    facet(
      "language_of_instruction",
      "Language of instruction",
      vals("Indonesian", "English", "Bilingual", "Other"),
    ),
    facet(
      "curriculum",
      "Curriculum",
      vals("Indonesian", "International", "Montessori", "Cambridge", "IB"),
    ),
    facet(
      "accreditation",
      "Accreditation",
      vals("Government accredited", "Internationally accredited", "Certified training"),
    ),
    facet("facilities", "Facilities", vals("Meals", "Transport", "Playground", "Sports", "Boarding")),
    facet(
      "support",
      "Support",
      vals("Special needs support", "Tutoring", "Trial class", "Placement testing"),
    ),
  ],
  "events-weddings": [
    facet(
      "event_type",
      "Event type",
      vals("Wedding", "Engagement", "Birthday", "Corporate", "Festival", "Private party"),
    ),
    facet(
      "service",
      "Service",
      vals("Planning", "Coordination", "Venue", "Décor", "Entertainment", "Rentals"),
    ),
    facet(
      "event_size",
      "Event size",
      pairs(
        ["under-25", "Under 25"],
        ["25-50", "25–50"],
        ["51-100", "51–100"],
        ["101-250", "101–250"],
        ["250-plus", "250+"],
      ),
    ),
    facet(
      "setting",
      "Setting",
      vals("Beachfront", "Garden", "Hotel", "Villa", "Restaurant", "Indoor", "Outdoor"),
    ),
    facet(
      "planning_level",
      "Planning level",
      vals("Full planning", "Partial planning", "Day-of coordination"),
    ),
    facet(
      "style",
      "Style",
      vals("Traditional Balinese", "Indonesian", "Western", "Modern", "Luxury", "Intimate"),
    ),
    facet(
      "destination_service",
      "Destination service",
      vals("Local events", "Destination weddings", "International clients"),
    ),
    facet(
      "rental_type",
      "Rental type",
      vals("Furniture", "Tents", "Tableware", "Lighting", "Sound systems"),
    ),
    facet(
      "entertainment",
      "Entertainment",
      vals("DJ", "Live band", "Traditional performance", "MC"),
    ),
    facet("package", "Package", vals("Venue only", "All-inclusive", "Custom package")),
  ],
  "pets-animals": [
    facet(
      "animal",
      "Animal",
      vals("Dog", "Cat", "Bird", "Reptile", "Livestock", "Exotic animal"),
    ),
    facet(
      "service",
      "Service",
      vals("Veterinary", "Grooming", "Boarding", "Daycare", "Walking", "Training", "Retail"),
    ),
    facet(
      "veterinary_specialty",
      "Veterinary specialty",
      vals("General", "Surgery", "Dental", "Vaccination", "Emergency"),
    ),
    facet(
      "service_mode",
      "Service mode",
      vals("At clinic", "Home visit", "Pickup and delivery"),
    ),
    facet("boarding_type", "Boarding type", vals("Private room", "Shared", "Cage-free", "Long-term")),
    facet("pet_size", "Pet size", vals("Small", "Medium", "Large")),
    facet(
      "requirements",
      "Requirements",
      vals("Vaccination required", "Temperament assessment", "Sterilized pets only"),
    ),
    facet("availability", "Availability", vals("Appointment", "Walk-in", "Emergency 24-hour")),
    facet(
      "facilities",
      "Facilities",
      vals("Outdoor area", "Air-conditioned rooms", "Webcam", "Exercise"),
    ),
    facet(
      "credentials",
      "Credentials",
      vals("Licensed veterinarian", "Certified trainer", "Registered rescue"),
    ),
  ],
  "logistics-delivery": [
    facet(
      "service",
      "Service",
      vals("Courier", "Local delivery", "Freight", "Warehousing", "Fulfillment", "Customs"),
    ),
    facet(
      "shipment",
      "Shipment",
      vals("Documents", "Parcels", "Food", "Furniture", "Vehicles", "Commercial cargo"),
    ),
    facet("coverage", "Coverage", vals("Local", "Inter-island", "Nationwide", "International")),
    facet("speed", "Speed", vals("Instant", "Same-day", "Next-day", "Standard", "Scheduled")),
    facet(
      "transport",
      "Transport",
      vals("Motorcycle", "Car", "Van", "Truck", "Air freight", "Sea freight"),
    ),
    facet(
      "weight",
      "Weight",
      pairs(
        ["under-5kg", "Under 5 kg"],
        ["5-20kg", "5–20 kg"],
        ["20-100kg", "20–100 kg"],
        ["freight", "Freight"],
      ),
    ),
    facet(
      "features",
      "Features",
      vals("Door-to-door", "Pickup", "Tracking", "Proof of delivery"),
    ),
    facet("payments", "Payment", vals("Prepaid", "Cash on delivery", "Business account")),
    facet("protection", "Protection", vals("Insurance", "Fragile handling", "Secure transport")),
    facet(
      "special_handling",
      "Special handling",
      vals("Refrigerated", "Frozen", "Hazardous", "Oversized"),
    ),
    facet(
      "business_services",
      "Business services",
      vals("Warehousing", "Packing", "Fulfillment", "Inventory management"),
    ),
  ],
};

/**
 * Path-indexable (category, facet, value) triples. Category-only `/c/{slug}`
 * pages are also indexable when they have results. Everything else is query
 * string + noindex.
 */
export const INDEXABLE_FACET_PATHS: {
  categories: string[];
  facet: string;
  values: string[];
}[] = [
  {
    categories: [
      "restaurants",
      "warungs-local-food",
      "seafood-restaurants",
      "food-drink",
    ],
    facet: "cuisine",
    values: ["balinese", "indonesian", "javanese"],
  },
  {
    categories: [
      "restaurants",
      "warungs-local-food",
      "cafes-coffee-shops",
      "vegetarian-vegan-dining",
      "food-drink",
    ],
    facet: "dietary",
    values: ["halal", "vegetarian", "vegan"],
  },
  {
    categories: ["hotels", "resorts", "villas", "hotels-accommodation"],
    facet: "location_feature",
    values: ["beachfront", "ocean-view"],
  },
  {
    categories: ["pharmacies", "clinics-hospitals", "health-medical"],
    facet: "availability",
    values: ["24-hours"],
  },
  {
    categories: ["motorcycle-scooter-rentals", "car-rentals"],
    facet: "rental_type",
    values: ["self-drive", "with-driver"],
  },
  {
    categories: ["cafes-coffee-shops", "restaurants", "food-drink"],
    facet: "meal",
    values: ["breakfast", "brunch"],
  },
  {
    categories: [
      "diving-snorkeling",
      "surf-schools-rentals",
      "travel-experiences",
    ],
    facet: "activity",
    values: ["diving", "snorkeling", "surfing", "cultural"],
  },
];

function mergeFacetDefs(base: FacetDef[], extra: FacetDef[]): FacetDef[] {
  const map = new Map<string, FacetDef>();
  for (const f of [...base, ...extra]) {
    const existing = map.get(f.key);
    if (!existing) {
      map.set(f.key, { ...f, values: [...f.values] });
      continue;
    }
    const seen = new Set(existing.values.map((v) => v.slug));
    const values = [...existing.values];
    for (const v of f.values) {
      if (!seen.has(v.slug)) {
        seen.add(v.slug);
        values.push(v);
      }
    }
    map.set(f.key, {
      ...existing,
      source: existing.source === "stored" || f.source === "stored" ? "stored" : existing.source,
      values,
    });
  }
  return [...map.values()];
}

const facetIndex = new Map<string, Map<string, FacetValue>>();

function indexFacet(def: FacetDef) {
  let byKey = facetIndex.get(def.key);
  if (!byKey) {
    byKey = new Map();
    facetIndex.set(def.key, byKey);
  }
  for (const v of def.values) {
    byKey.set(v.slug, v);
    byKey.set(slugify(v.label), v);
  }
}

for (const f of GLOBAL_FACETS) indexFacet(f);
for (const group of Object.values(GROUP_FACETS)) {
  for (const f of group) indexFacet(f);
}

export function facetsForListingCategory(category: string): FacetDef[] {
  const rec = categoryRecord(category);
  const group = rec?.groupSlug ?? category;
  return mergeFacetDefs(
    GLOBAL_FACETS.filter((f) => f.source !== "geo"),
    GROUP_FACETS[group] ?? [],
  );
}

export function facetsForCategory(categorySlug: string | undefined): FacetDef[] {
  if (!categorySlug) {
    return GLOBAL_FACETS.filter((f) => f.source !== "geo");
  }
  return facetsForListingCategory(categorySlug);
}

export function canonicalizeFacetValue(
  key: string,
  raw: string,
): string | undefined {
  const k = key.trim();
  const v = slugify(raw.trim());
  if (!k || !v) return undefined;
  return facetIndex.get(k)?.get(v)?.slug;
}

export function facetValueLabel(key: string, value: string): string {
  const slug = canonicalizeFacetValue(key, value);
  if (!slug) return value;
  return facetIndex.get(key)?.get(slug)?.label ?? value;
}

export function isKnownFacetKey(key: string): boolean {
  return facetIndex.has(key);
}

export function knownFacetKeys(): string[] {
  return [...facetIndex.keys()];
}

export function isIndexableFacetPath(
  category: string,
  facet: string,
  value: string,
): boolean {
  const v = canonicalizeFacetValue(facet, value) ?? slugify(value);
  return INDEXABLE_FACET_PATHS.some(
    (rule) =>
      rule.categories.includes(category) &&
      rule.facet === facet &&
      rule.values.includes(v),
  );
}

export function serializeFacetsCatalog() {
  return {
    global: GLOBAL_FACETS,
    byGroup: GROUP_FACETS,
    indexable: INDEXABLE_FACET_PATHS,
  };
}

export { slugify as slugifyFacet };
