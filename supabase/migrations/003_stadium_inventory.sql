-- Stadium seat map + listing-level inventory (Phase 2)

ALTER TABLE venues ADD COLUMN IF NOT EXISTS stadium_map_slug TEXT;

ALTER TABLE events ADD COLUMN IF NOT EXISTS seat_map_enabled BOOLEAN DEFAULT false;

CREATE TABLE stadium_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  svg_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (venue_id, slug)
);

CREATE TABLE stadium_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  section_number TEXT NOT NULL,
  level TEXT NOT NULL,
  zone TEXT,
  label_x NUMERIC,
  label_y NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (venue_id, section_number)
);

CREATE TABLE stadium_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES stadium_sections(id) ON DELETE CASCADE,
  row_label TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (section_id, row_label)
);

CREATE TABLE ticket_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  section_id UUID REFERENCES stadium_sections(id) ON DELETE SET NULL,
  section_number TEXT,
  row_label TEXT,
  product_name TEXT,
  listing_type TEXT NOT NULL DEFAULT 'seat',
  quantity INTEGER NOT NULL DEFAULT 1,
  quantity_available INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  perks TEXT[] DEFAULT '{}',
  badges TEXT[] DEFAULT '{}',
  view_score NUMERIC(3, 1),
  view_label TEXT,
  status ticket_status DEFAULT 'available',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES ticket_listings(id) ON DELETE SET NULL;
ALTER TABLE order_items ALTER COLUMN category_id DROP NOT NULL;

CREATE INDEX idx_stadium_sections_venue ON stadium_sections(venue_id);
CREATE INDEX idx_ticket_listings_event ON ticket_listings(event_id);
CREATE INDEX idx_ticket_listings_section ON ticket_listings(section_number);
CREATE INDEX idx_ticket_listings_status ON ticket_listings(status) WHERE status = 'available';

ALTER TABLE stadium_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE stadium_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE stadium_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read stadium_maps" ON stadium_maps FOR SELECT USING (true);
CREATE POLICY "Public read stadium_sections" ON stadium_sections FOR SELECT USING (true);
CREATE POLICY "Public read stadium_rows" ON stadium_rows FOR SELECT USING (true);
CREATE POLICY "Public read ticket_listings" ON ticket_listings FOR SELECT USING (true);
