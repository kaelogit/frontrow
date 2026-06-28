-- Admin-managed event metadata (item 51)

ALTER TABLE events ADD COLUMN IF NOT EXISTS match_number TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS queue_enabled BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS scarcity_override INTEGER;
