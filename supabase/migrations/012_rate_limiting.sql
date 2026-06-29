-- API rate limiting (backlog item 73)
-- Service-role only. Anon/public has no access.

CREATE TABLE IF NOT EXISTS api_rate_limits (
  key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  window_seconds INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start, window_seconds)
);

ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No public api_rate_limits" ON api_rate_limits FOR ALL USING (false);

-- Atomically record a hit. Returns whether the request is allowed.
CREATE OR REPLACE FUNCTION rate_limit_hit(
  p_key TEXT,
  p_window_seconds INTEGER,
  p_limit INTEGER
) RETURNS TABLE (
  allowed BOOLEAN,
  remaining INTEGER,
  reset_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_window_start TIMESTAMPTZ := to_timestamp(floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds);
  v_count INTEGER;
BEGIN
  INSERT INTO api_rate_limits(key, window_start, window_seconds, count)
  VALUES (p_key, v_window_start, p_window_seconds, 1)
  ON CONFLICT (key, window_start, window_seconds)
  DO UPDATE SET count = api_rate_limits.count + 1
  RETURNING api_rate_limits.count INTO v_count;

  allowed := v_count <= p_limit;
  remaining := GREATEST(0, p_limit - v_count);
  reset_at := v_window_start + make_interval(secs => p_window_seconds);
  RETURN NEXT;
END;
$$;

