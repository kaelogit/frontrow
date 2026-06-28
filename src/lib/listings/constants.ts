export const LISTING_PERKS = [
  "Clear view",
  "Aisle seat",
  "Unrestricted view",
  "1 ticket together",
  "2 tickets together",
  "3 tickets together",
  "4 tickets together",
  "8 tickets together",
] as const;

export const LISTING_BADGES = ["Last tickets", "Fan favorite"] as const;

export const LISTING_TYPES = [
  { value: "seat", label: "Seat (section + row)" },
  { value: "zone", label: "Zone / category" },
  { value: "hospitality", label: "Hospitality package" },
] as const;

export function viewLabelFromScore(score: number | null): string | null {
  if (score == null) return null;
  if (score >= 8.5) return "Amazing";
  if (score >= 7) return "Great";
  if (score >= 5) return "Good";
  return null;
}
