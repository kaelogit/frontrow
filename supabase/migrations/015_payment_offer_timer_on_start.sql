-- Timer starts when customer opens the link, not when admin creates it

ALTER TABLE payment_offers
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expiry_minutes INT NOT NULL DEFAULT 840;

ALTER TABLE payment_offers ALTER COLUMN expires_at DROP NOT NULL;

-- Existing links already had a running timer from creation — treat as started
UPDATE payment_offers
SET
  started_at = created_at,
  expiry_minutes = GREATEST(
    1,
    ROUND(EXTRACT(EPOCH FROM (expires_at - created_at)) / 60)::int
  )
WHERE expires_at IS NOT NULL AND started_at IS NULL;
