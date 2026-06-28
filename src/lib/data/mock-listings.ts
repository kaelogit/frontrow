import type { TicketListing } from "@/types/database";
import { frontrowlyCompareAt, frontrowlyPrice } from "@/lib/pricing/frontrowly-price";
import { BC_PLACE_SECTIONS } from "@/lib/stadium/bc-place-sections";
import { mockWorldCupMatch104Listings, WORLD_CUP_MATCH_104_EVENT_ID } from "@/lib/data/mock-world-cup-match-104-listings";
import { mockWorldCupMatch98Listings, WORLD_CUP_MATCH_98_EVENT_ID } from "@/lib/data/mock-world-cup-match-98-listings";
import { mockWorldCupMatch99Listings, WORLD_CUP_MATCH_99_EVENT_ID } from "@/lib/data/mock-world-cup-match-99-listings";
import { mockWorldCupMatch100Listings, WORLD_CUP_MATCH_100_EVENT_ID } from "@/lib/data/mock-world-cup-match-100-listings";
import { mockWorldCupMatch101Listings, WORLD_CUP_MATCH_101_EVENT_ID } from "@/lib/data/mock-world-cup-match-101-listings";
import { mockWorldCupMatch102Listings, WORLD_CUP_MATCH_102_EVENT_ID } from "@/lib/data/mock-world-cup-match-102-listings";
import { mockWorldCupMatch103Listings, WORLD_CUP_MATCH_103_EVENT_ID } from "@/lib/data/mock-world-cup-match-103-listings";
import { mockUruguaySpainListings, URUGUAY_SPAIN_EVENT_ID } from "@/lib/data/mock-uruguay-spain-listings";
import { mockCaboVerdeSaudiListings, CABO_VERDE_SAUDI_EVENT_ID } from "@/lib/data/mock-cabo-verde-saudi-listings";
import { mockEgyptIranListings, EGYPT_IRAN_EVENT_ID } from "@/lib/data/mock-egypt-iran-listings";
import { mockCroatiaGhanaListings, CROATIA_GHANA_EVENT_ID } from "@/lib/data/mock-croatia-ghana-listings";
import { mockWorldCupMatch80Listings, WORLD_CUP_MATCH_80_EVENT_ID } from "@/lib/data/mock-world-cup-match-80-listings";
import { mockWorldCupMatch81Listings, WORLD_CUP_MATCH_81_EVENT_ID } from "@/lib/data/mock-world-cup-match-81-listings";
import { mockWorldCupMatch82Listings, WORLD_CUP_MATCH_82_EVENT_ID } from "@/lib/data/mock-world-cup-match-82-listings";
import { mockWorldCupMatch83Listings, WORLD_CUP_MATCH_83_EVENT_ID } from "@/lib/data/mock-world-cup-match-83-listings";
import { mockWorldCupMatch84Listings, WORLD_CUP_MATCH_84_EVENT_ID } from "@/lib/data/mock-world-cup-match-84-listings";
import { mockWorldCupMatch85Listings, WORLD_CUP_MATCH_85_EVENT_ID } from "@/lib/data/mock-world-cup-match-85-listings";
import { mockWorldCupMatch86Listings, WORLD_CUP_MATCH_86_EVENT_ID } from "@/lib/data/mock-world-cup-match-86-listings";
import { mockWorldCupMatch88Listings, WORLD_CUP_MATCH_88_EVENT_ID } from "@/lib/data/mock-world-cup-match-88-listings";
import { mockWorldCupMatch87Listings, WORLD_CUP_MATCH_87_EVENT_ID } from "@/lib/data/mock-world-cup-match-87-listings";
import { mockWorldCupMatch89Listings, WORLD_CUP_MATCH_89_EVENT_ID } from "@/lib/data/mock-world-cup-match-89-listings";
import { mockWorldCupMatch90Listings, WORLD_CUP_MATCH_90_EVENT_ID } from "@/lib/data/mock-world-cup-match-90-listings";
import { mockWorldCupMatch91Listings, WORLD_CUP_MATCH_91_EVENT_ID } from "@/lib/data/mock-world-cup-match-91-listings";
import { mockWorldCupMatch92Listings, WORLD_CUP_MATCH_92_EVENT_ID } from "@/lib/data/mock-world-cup-match-92-listings";
import { mockWorldCupMatch93Listings, WORLD_CUP_MATCH_93_EVENT_ID } from "@/lib/data/mock-world-cup-match-93-listings";
import { mockWorldCupMatch94Listings, WORLD_CUP_MATCH_94_EVENT_ID } from "@/lib/data/mock-world-cup-match-94-listings";
import { mockWorldCupMatch95Listings, WORLD_CUP_MATCH_95_EVENT_ID } from "@/lib/data/mock-world-cup-match-95-listings";
import { mockWorldCupMatch96Listings, WORLD_CUP_MATCH_96_EVENT_ID } from "@/lib/data/mock-world-cup-match-96-listings";
import { mockWorldCupMatch97Listings, WORLD_CUP_MATCH_97_EVENT_ID } from "@/lib/data/mock-world-cup-match-97-listings";

const EVENT_ID = "wc-64";

const ROWS = ["A", "B", "D", "E", "G", "K", "M", "P", "CC", "FF", "HH", "UU", "SS"];

function listing(
  id: string,
  section: string | null,
  row: string | null,
  qty: number,
  marketNowPrice: number,
  opts: {
    perks?: string[];
    badges?: string[];
    viewScore?: number;
    viewLabel?: string;
    productName?: string;
    type?: TicketListing["listing_type"];
    qtyAvailable?: number;
  } = {}
): TicketListing {
  return {
    id,
    event_id: EVENT_ID,
    section_id: null,
    section_number: section,
    row_label: row,
    product_name: opts.productName ?? null,
    listing_type: opts.type ?? (section ? "seat" : "zone"),
    quantity: qty,
    quantity_available: opts.qtyAvailable ?? qty,
    price: frontrowlyPrice(marketNowPrice),
    compare_at_price: frontrowlyCompareAt(marketNowPrice),
    currency: "USD",
    perks: opts.perks ?? ["Clear view", `${qty} tickets together`],
    badges: opts.badges ?? [],
    view_score: opts.viewScore ?? null,
    view_label: opts.viewLabel ?? null,
    status: "available",
    sort_order: 0,
  };
}

/** Viagogo reference listings from BC Place NZ vs Belgium */
const anchorListings: TicketListing[] = [
  listing("l1", "342", "E", 2, 404, {
    badges: ["Last tickets"],
    viewScore: 9.8,
    viewLabel: "Amazing",
    perks: ["Limited view", "2 tickets together"],
    qtyAvailable: 2,
  }),
  listing("l2", "217", "K", 2, 420, {
    badges: ["Fan favorite"],
    viewScore: 8.9,
    viewLabel: "Amazing",
    qtyAvailable: 2,
  }),
  listing("l3", "442", "E", 2, 354, {
    badges: ["Last tickets"],
    viewScore: 8.6,
    viewLabel: "Amazing",
    qtyAvailable: 2,
  }),
  listing("l4", "413", null, 2, 355, {
    viewScore: 8.3,
    viewLabel: "Great",
    perks: ["Piggyback seats - they're together in two consecutive rows", "Limited view"],
    qtyAvailable: 4,
  }),
  listing("l5", "209", "CC", 2, 420, {
    badges: ["Last tickets"],
    viewScore: 7.7,
    viewLabel: "Great",
    qtyAvailable: 2,
  }),
  listing("l6", "415", "HH", 2, 363, {
    viewScore: 8.5,
    viewLabel: "Amazing",
    perks: ["Limited view", "2 tickets together"],
    qtyAvailable: 2,
  }),
  listing("l7", "225", "FF", 2, 400, {
    badges: ["Last tickets"],
    viewScore: 7.0,
    viewLabel: "Great",
    qtyAvailable: 2,
  }),
  listing("l8", "346", "G", 2, 404, {
    badges: ["Last tickets"],
    viewScore: 7.9,
    viewLabel: "Great",
    qtyAvailable: 2,
  }),
  listing("l9", "248", "P", 2, 417, {
    viewScore: 7.5,
    viewLabel: "Great",
    qtyAvailable: 2,
  }),
  listing("l10", "421", "A", 2, 507, {
    badges: ["Last tickets"],
    viewScore: 8.6,
    viewLabel: "Amazing",
  }),
];

/** Generate additional BC Place inventory (~115 more) for viagogo-scale browse */
function generateBulkListings(startId: number, count: number): TicketListing[] {
  const out: TicketListing[] = [];
  let id = startId;

  for (let i = 0; i < count; i++) {
    const section = BC_PLACE_SECTIONS[i % BC_PLACE_SECTIONS.length];
    const row = ROWS[i % ROWS.length];
    const base = section.level === "200" ? 420 : section.level === "300" ? 380 : 340;
    const marketNow = base + (i % 17) * 12 + (parseInt(section.number, 10) % 7) * 3;
    const qty = i % 9 === 0 ? 1 : 2;
    const badges: string[] = [];
    if (i % 11 === 0) badges.push("Last tickets");
    if (i % 13 === 0) badges.push("Fan favorite");
    const viewScore = 6.5 + (i % 35) / 10;

    let perks: string[] =
      i % 4 === 0
        ? ["Limited view", `${qty} ticket${qty !== 1 ? "s" : ""} together`]
        : ["Clear view", `${qty} ticket${qty !== 1 ? "s" : ""} together`];

    if (i % 23 === 0) perks = [...perks, "Belgium Supporters Seats"];
    if (i % 29 === 0) perks = [...perks, "New Zealand Supporters Seats"];
    if (i % 31 === 0) perks = [...perks, "ADA Accessible seating"];
    if (row === "A") perks = [...perks, "Front row of section"];
    if (row === "B") perks = [...perks, "Second row of section"];

    out.push(
      listing(`gen-${id++}`, section.number, row, qty, marketNow, {
        badges,
        viewScore: Math.round(viewScore * 10) / 10,
        viewLabel: viewScore >= 8.5 ? "Amazing" : viewScore >= 7 ? "Great" : "Good",
        qtyAvailable: i % 7 === 0 ? 2 : qty,
        perks,
      })
    );
  }

  // Hospitality & special zones
  out.push(
    listing("gen-h1", null, null, 2, 890, {
      productName: "Trophy Lounge Hospitality",
      type: "hospitality",
      viewScore: 9.5,
      viewLabel: "Amazing",
      perks: ["Hospitality package", "2 tickets together"],
    }),
    listing("gen-h2", null, null, 1, 650, {
      productName: "Club Level Package",
      type: "hospitality",
      perks: ["Club access", "1 ticket"],
      qtyAvailable: 1,
    }),
    listing("gen-bel", "431", "E", 1, 316, {
      badges: ["Last tickets"],
      viewScore: 8.7,
      viewLabel: "Amazing",
      perks: ["Clear view", "Belgium Supporters Seats", "1 ticket"],
      qtyAvailable: 1,
    }),
    listing("gen-nz", "451", "SS", 1, 316, {
      viewScore: 8.6,
      viewLabel: "Amazing",
      perks: ["Clear view", "New Zealand Supporters Seats", "1 ticket"],
      qtyAvailable: 1,
    })
  );

  return out;
}

/** ~125 viagogo-scale listings for NZ vs Belgium @ BC Place */
export const mockNzBelgiumListings: TicketListing[] = [
  ...anchorListings,
  ...generateBulkListings(100, 115),
];

export function getMockListingsForEvent(eventId: string): TicketListing[] {
  if (eventId === EVENT_ID) return mockNzBelgiumListings;
  if (eventId === WORLD_CUP_MATCH_104_EVENT_ID) return mockWorldCupMatch104Listings;
  if (eventId === WORLD_CUP_MATCH_97_EVENT_ID) return mockWorldCupMatch97Listings;
  if (eventId === WORLD_CUP_MATCH_98_EVENT_ID) return mockWorldCupMatch98Listings;
  if (eventId === WORLD_CUP_MATCH_99_EVENT_ID) return mockWorldCupMatch99Listings;
  if (eventId === WORLD_CUP_MATCH_100_EVENT_ID) return mockWorldCupMatch100Listings;
  if (eventId === WORLD_CUP_MATCH_101_EVENT_ID) return mockWorldCupMatch101Listings;
  if (eventId === WORLD_CUP_MATCH_102_EVENT_ID) return mockWorldCupMatch102Listings;
  if (eventId === WORLD_CUP_MATCH_103_EVENT_ID) return mockWorldCupMatch103Listings;
  if (eventId === URUGUAY_SPAIN_EVENT_ID) return mockUruguaySpainListings;
  if (eventId === CABO_VERDE_SAUDI_EVENT_ID) return mockCaboVerdeSaudiListings;
  if (eventId === EGYPT_IRAN_EVENT_ID) return mockEgyptIranListings;
  if (eventId === CROATIA_GHANA_EVENT_ID) return mockCroatiaGhanaListings;
  if (eventId === WORLD_CUP_MATCH_80_EVENT_ID) return mockWorldCupMatch80Listings;
  if (eventId === WORLD_CUP_MATCH_81_EVENT_ID) return mockWorldCupMatch81Listings;
  if (eventId === WORLD_CUP_MATCH_82_EVENT_ID) return mockWorldCupMatch82Listings;
  if (eventId === WORLD_CUP_MATCH_83_EVENT_ID) return mockWorldCupMatch83Listings;
  if (eventId === WORLD_CUP_MATCH_84_EVENT_ID) return mockWorldCupMatch84Listings;
  if (eventId === WORLD_CUP_MATCH_85_EVENT_ID) return mockWorldCupMatch85Listings;
  if (eventId === WORLD_CUP_MATCH_86_EVENT_ID) return mockWorldCupMatch86Listings;
  if (eventId === WORLD_CUP_MATCH_88_EVENT_ID) return mockWorldCupMatch88Listings;
  if (eventId === WORLD_CUP_MATCH_87_EVENT_ID) return mockWorldCupMatch87Listings;
  if (eventId === WORLD_CUP_MATCH_89_EVENT_ID) return mockWorldCupMatch89Listings;
  if (eventId === WORLD_CUP_MATCH_90_EVENT_ID) return mockWorldCupMatch90Listings;
  if (eventId === WORLD_CUP_MATCH_91_EVENT_ID) return mockWorldCupMatch91Listings;
  if (eventId === WORLD_CUP_MATCH_92_EVENT_ID) return mockWorldCupMatch92Listings;
  if (eventId === WORLD_CUP_MATCH_93_EVENT_ID) return mockWorldCupMatch93Listings;
  if (eventId === WORLD_CUP_MATCH_94_EVENT_ID) return mockWorldCupMatch94Listings;
  if (eventId === WORLD_CUP_MATCH_95_EVENT_ID) return mockWorldCupMatch95Listings;
  if (eventId === WORLD_CUP_MATCH_96_EVENT_ID) return mockWorldCupMatch96Listings;
  return [];
}

export const NZ_BELGIUM_EVENT_ID = EVENT_ID;
