-- Admin stadium map manager (backlog item 53)

ALTER TABLE stadium_maps ADD COLUMN IF NOT EXISTS svg_content TEXT;
ALTER TABLE stadium_maps ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
