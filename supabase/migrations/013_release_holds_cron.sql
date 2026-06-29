-- Hourly cron: expire stale reservation holds (replaces Vercel cron on Hobby)
-- Enable pg_cron in Supabase Dashboard → Database → Extensions before applying.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

DO $cron$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE NOTICE 'pg_cron extension not available — enable in Dashboard, then re-run the schedule block below.';
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'release-expired-inventory') THEN
    PERFORM cron.unschedule('release-expired-inventory');
  END IF;

  PERFORM cron.schedule(
    'release-expired-inventory',
    '0 * * * *',
    $job$SELECT public.release_expired_inventory()$job$
  );
END;
$cron$;
