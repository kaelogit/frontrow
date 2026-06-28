/** Demo / staging "today" — set NEXT_PUBLIC_SITE_DATE=2026-06-25 to simulate tournament week */
export function getSiteNow(): Date {
  const override = process.env.NEXT_PUBLIC_SITE_DATE;
  if (override?.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return new Date(`${override}T12:00:00`);
  }
  return new Date();
}
