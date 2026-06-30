-- Admin payment credentials, per-order payment links, receipt submissions

CREATE TYPE payment_credential_type AS ENUM (
  'wire_us',
  'swift',
  'cashapp',
  'apple_pay',
  'zelle',
  'paypal',
  'crypto',
  'other'
);

CREATE TYPE payment_offer_status AS ENUM (
  'active',
  'submitted',
  'expired',
  'revoked',
  'paid'
);

CREATE TABLE payment_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  type payment_credential_type NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_reference TEXT NOT NULL,
  credential_id UUID REFERENCES payment_credentials(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  method_type payment_credential_type NOT NULL,
  method_label TEXT NOT NULL,
  instructions JSONB NOT NULL DEFAULT '{}',
  crypto_payment_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  status payment_offer_status NOT NULL DEFAULT 'active',
  revoked_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES payment_offers(id) ON DELETE CASCADE,
  receipt_url TEXT NOT NULL,
  receipt_filename TEXT,
  customer_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_offers_token ON payment_offers(token);
CREATE INDEX idx_payment_offers_order ON payment_offers(order_reference);
CREATE INDEX idx_payment_offers_status ON payment_offers(status);
CREATE INDEX idx_payment_credentials_type ON payment_credentials(type);

CREATE TRIGGER payment_credentials_updated_at
  BEFORE UPDATE ON payment_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE payment_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public payment_credentials" ON payment_credentials FOR SELECT USING (false);
CREATE POLICY "No public payment_offers" ON payment_offers FOR SELECT USING (false);
CREATE POLICY "No public payment_submissions" ON payment_submissions FOR SELECT USING (false);

-- Receipt uploads (admin reads via service role)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-receipts',
  'payment-receipts',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
