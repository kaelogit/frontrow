-- Waiting room queue sessions (items 37–38)

ALTER TABLE events ADD COLUMN IF NOT EXISTS queue_admission_rate INTEGER DEFAULT 10;

CREATE TABLE IF NOT EXISTS queue_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  position INTEGER NOT NULL,
  admitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_queue_sessions_event_created
  ON queue_sessions(event_id, created_at);

CREATE INDEX IF NOT EXISTS idx_queue_sessions_event_position
  ON queue_sessions(event_id, position);

CREATE UNIQUE INDEX IF NOT EXISTS idx_queue_sessions_event_token
  ON queue_sessions(event_id, token);
