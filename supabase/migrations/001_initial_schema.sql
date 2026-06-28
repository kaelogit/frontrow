-- Frontrowly initial schema
-- Run in Supabase SQL Editor or via supabase db push

-- Enums
CREATE TYPE event_status AS ENUM ('scheduled', 'sold_out', 'cancelled', 'completed');
CREATE TYPE ticket_status AS ENUM ('available', 'reserved', 'sold');
CREATE TYPE order_status AS ENUM (
  'reservation_requested',
  'pending_payment',
  'paid',
  'ticket_issued',
  'completed',
  'cancelled',
  'expired'
);
CREATE TYPE payment_method AS ENUM ('card', 'crypto', 'reservation');

-- Competitions (World Cup, Premier League, NBA, etc.)
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  sport TEXT NOT NULL DEFAULT 'football',
  country TEXT,
  logo_url TEXT,
  description TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  country TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Venues
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  capacity INTEGER,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Events / matches
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
  home_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  away_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  status event_status DEFAULT 'scheduled',
  image_url TEXT,
  min_price DECIMAL(12, 2),
  currency TEXT DEFAULT 'USD',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ticket categories per event
CREATE TABLE ticket_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  section TEXT,
  price DECIMAL(12, 2) NOT NULL,
  quantity_total INTEGER NOT NULL DEFAULT 0,
  quantity_available INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Individual tickets (optional seat-level inventory)
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES ticket_categories(id) ON DELETE CASCADE,
  section TEXT,
  row_label TEXT,
  seat_number TEXT,
  price DECIMAL(12, 2) NOT NULL,
  status ticket_status DEFAULT 'available',
  reserved_until TIMESTAMPTZ,
  order_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Competitor price tracking (manual admin entry)
CREATE TABLE competitor_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  url TEXT,
  noted_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  total_amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method payment_method NOT NULL,
  status order_status DEFAULT 'pending_payment',
  nexapay_ref TEXT,
  reserved_until TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  ticket_sent_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order line items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES ticket_categories(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tickets ADD CONSTRAINT tickets_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_events_competition ON events(competition_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_featured ON events(featured) WHERE featured = true;
CREATE INDEX idx_ticket_categories_event ON ticket_categories(event_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_reference ON orders(reference);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER competitions_updated_at BEFORE UPDATE ON competitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (public read for catalogue, service role for writes)
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read competitions" ON competitions FOR SELECT USING (true);
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read venues" ON venues FOR SELECT USING (true);
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read ticket_categories" ON ticket_categories FOR SELECT USING (true);
CREATE POLICY "Public read competitor_prices" ON competitor_prices FOR SELECT USING (true);

-- Orders: customers can read own by reference (handled via API with service role for MVP)
CREATE POLICY "No public orders" ON orders FOR SELECT USING (false);
CREATE POLICY "No public order_items" ON order_items FOR SELECT USING (false);
