-- Round of 32 teams resolved — matches 80–88 (July 1–3 2026)
-- Source: FIFA World Cup 2026 group-stage results
-- Safe to re-run — clears bracket labels when team IDs are set

UPDATE events e SET
  home_team_id = (SELECT id FROM teams WHERE slug = 'england'),
  away_team_id = (SELECT id FROM teams WHERE slug = 'congo-dr'),
  home_team_label = NULL,
  away_team_label = NULL,
  title = 'England vs Congo DR'
WHERE e.slug = 'world-cup-match-80';

UPDATE events e SET
  home_team_id = (SELECT id FROM teams WHERE slug = 'usa'),
  away_team_id = (SELECT id FROM teams WHERE slug = 'bosnia-herzegovina'),
  home_team_label = NULL,
  away_team_label = NULL,
  title = 'United States vs Bosnia and Herzegovina'
WHERE e.slug = 'world-cup-match-81';

UPDATE events e SET
  home_team_id = (SELECT id FROM teams WHERE slug = 'belgium'),
  away_team_id = (SELECT id FROM teams WHERE slug = 'senegal'),
  home_team_label = NULL,
  away_team_label = NULL,
  title = 'Belgium vs Senegal'
WHERE e.slug = 'world-cup-match-82';

UPDATE events e SET
  home_team_id = (SELECT id FROM teams WHERE slug = 'portugal'),
  away_team_id = (SELECT id FROM teams WHERE slug = 'croatia'),
  home_team_label = NULL,
  away_team_label = NULL,
  title = 'Portugal vs Croatia'
WHERE e.slug = 'world-cup-match-83';

UPDATE events e SET
  home_team_id = (SELECT id FROM teams WHERE slug = 'spain'),
  away_team_id = (SELECT id FROM teams WHERE slug = 'austria'),
  home_team_label = NULL,
  away_team_label = NULL,
  title = 'Spain vs Austria'
WHERE e.slug = 'world-cup-match-84';

UPDATE events e SET
  home_team_id = (SELECT id FROM teams WHERE slug = 'switzerland'),
  away_team_id = (SELECT id FROM teams WHERE slug = 'algeria'),
  home_team_label = NULL,
  away_team_label = NULL,
  title = 'Switzerland vs Algeria'
WHERE e.slug = 'world-cup-match-85';

UPDATE events e SET
  home_team_id = (SELECT id FROM teams WHERE slug = 'argentina'),
  away_team_id = (SELECT id FROM teams WHERE slug = 'cabo-verde'),
  home_team_label = NULL,
  away_team_label = NULL,
  title = 'Argentina vs Cabo Verde'
WHERE e.slug = 'world-cup-match-86';

UPDATE events e SET
  home_team_id = (SELECT id FROM teams WHERE slug = 'colombia'),
  away_team_id = (SELECT id FROM teams WHERE slug = 'ghana'),
  home_team_label = NULL,
  away_team_label = NULL,
  title = 'Colombia vs Ghana'
WHERE e.slug = 'world-cup-match-87';

UPDATE events e SET
  home_team_id = (SELECT id FROM teams WHERE slug = 'australia'),
  away_team_id = (SELECT id FROM teams WHERE slug = 'egypt'),
  home_team_label = NULL,
  away_team_label = NULL,
  title = 'Australia vs Egypt'
WHERE e.slug = 'world-cup-match-88';
