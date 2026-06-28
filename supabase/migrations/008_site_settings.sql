-- Site-wide settings (social proof, banners, FX — item 14 / 59)

CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

INSERT INTO site_settings (key, value) VALUES
  ('social_proof', '{
    "enabled": true,
    "viewersBase": 204807,
    "viewersJitterPct": 4,
    "viewersLabel": "World Cup events",
    "followersBase": 88600,
    "followersJitterPct": 2
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;
