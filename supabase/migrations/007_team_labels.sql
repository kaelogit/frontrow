-- Bracket placeholder labels when home/away team is TBD
-- e.g. "Winner Match 93" instead of generic "TBD"

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS home_team_label TEXT,
  ADD COLUMN IF NOT EXISTS away_team_label TEXT;

COMMENT ON COLUMN events.home_team_label IS 'Display label when home_team_id is null (e.g. Winner Match 93)';
COMMENT ON COLUMN events.away_team_label IS 'Display label when away_team_id is null (e.g. Winner Match 94)';
