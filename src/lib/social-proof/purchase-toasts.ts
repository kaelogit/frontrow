/** Fictional recent-purchase lines for live toast social proof */

export interface PurchaseToastMessage {
  id: string;
  flag: string;
  country: string;
  ticketCount: number;
  minutesAgo: number;
  eventLabel: string;
}

const COUNTRIES = [
  { flag: "🇲🇽", name: "Mexico" },
  { flag: "🇺🇸", name: "United States" },
  { flag: "🇨🇦", name: "Canada" },
  { flag: "🇧🇷", name: "Brazil" },
  { flag: "🇦🇷", name: "Argentina" },
  { flag: "🇬🇧", name: "United Kingdom" },
  { flag: "🇩🇪", name: "Germany" },
  { flag: "🇫🇷", name: "France" },
  { flag: "🇪🇸", name: "Spain" },
  { flag: "🇳🇱", name: "Netherlands" },
  { flag: "🇯🇵", name: "Japan" },
  { flag: "🇰🇷", name: "South Korea" },
  { flag: "🇦🇺", name: "Australia" },
  { flag: "🇮🇹", name: "Italy" },
  { flag: "🇨🇴", name: "Colombia" },
] as const;

const EVENT_LABELS = [
  "World Cup Final",
  "Quarterfinal · Match 98",
  "New Zealand vs Belgium",
  "Mexico vs USA",
  "Germany vs England",
  "Brazil vs Scotland",
  "Uruguay vs Spain",
  "Croatia vs Ghana",
] as const;

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildPurchaseToastPool(count = 14, seed = Date.now()): PurchaseToastMessage[] {
  const rand = mulberry32(seed);
  const usedMinutes = new Set<number>();

  return Array.from({ length: count }, (_, i) => {
    const country = COUNTRIES[Math.floor(rand() * COUNTRIES.length)];
    const ticketCount = 1 + Math.floor(rand() * 4);
    let minutesAgo = 8 + Math.floor(rand() * 52);
    while (usedMinutes.has(minutesAgo) && usedMinutes.size < 40) {
      minutesAgo = 8 + Math.floor(rand() * 52);
    }
    usedMinutes.add(minutesAgo);

    return {
      id: `toast-${seed}-${i}`,
      flag: country.flag,
      country: country.name,
      ticketCount,
      minutesAgo,
      eventLabel: EVENT_LABELS[Math.floor(rand() * EVENT_LABELS.length)],
    };
  });
}

export function formatPurchaseToast(message: PurchaseToastMessage): string {
  const tickets =
    message.ticketCount === 1
      ? "1 ticket"
      : `${message.ticketCount} tickets`;
  return `${message.flag} A customer from ${message.country} bought ${tickets} · ${message.minutesAgo} min ago`;
}
