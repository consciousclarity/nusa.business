/**
 * Drizzle/Postgres schema outline for production.
 * Runtime MVP uses the JSON repository; migrate to this schema when Postgres is live.
 */
export const postgresSchemaSql = `
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE islands (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE places (
  id TEXT PRIMARY KEY,
  island_id TEXT NOT NULL REFERENCES islands(id),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  parent_place_id TEXT REFERENCES places(id),
  summary TEXT NOT NULL,
  UNIQUE (island_id, slug)
);

CREATE TABLE businesses (
  id TEXT PRIMARY KEY,
  place_id TEXT NOT NULL REFERENCES places(id),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  categories TEXT[] NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  whatsapp TEXT,
  website TEXT,
  location GEOGRAPHY(POINT, 4326),
  gallery TEXT[] NOT NULL DEFAULT '{}',
  booking_mode TEXT NOT NULL DEFAULT 'none',
  owner_user_id TEXT,
  vendor_id TEXT,
  registered_by_agent_id TEXT,
  profile JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (place_id, slug)
);

CREATE TABLE claims (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  claimant_user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  author_name TEXT NOT NULL,
  service INT NOT NULL,
  value INT NOT NULL,
  location INT NOT NULL,
  cleanliness INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  mode TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  time_slot TEXT,
  guests INT,
  tickets INT,
  status TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vendor_links (
  id TEXT PRIMARY KEY,
  business_id TEXT UNIQUE NOT NULL REFERENCES businesses(id),
  mercur_vendor_id TEXT,
  commission_percent NUMERIC NOT NULL DEFAULT 0
);
`;
