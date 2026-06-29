/**
 * Parse viagogo paste → listings .mjs, SQL seed, and mock TS.
 * Usage: node scripts/import-viagogo-match.mjs <match-key> <paste-file>
 * Example: node scripts/import-viagogo-match.mjs match-66 scripts/data/pastes/match-66.txt
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { parseViagogoPaste } from "./lib/parse-viagogo-listings.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const MATCHES = {
  "match-65": {
    slug: "cabo-verde-vs-saudi-arabia",
    eventId: "wc-65",
    matchNumber: "65",
    title: "Cabo Verde vs Saudi Arabia",
    subtitle: "Match 65 · Group H · World Cup 2026",
    description:
      "FIFA World Cup 2026 group stage at NRG Stadium, Houston. Marketplace listings from reference inventory.",
    eventDate: "2026-06-26",
    eventTime: "19:00",
    venueSlug: "nrg-stadium",
    homeTeam: ["cabo-verde", "Cabo Verde", "Cabo Verde"],
    awayTeam: ["saudi-arabia", "Saudi Arabia", "Saudi Arabia"],
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "cabo-verde-saudi-viagogo-listings.mjs",
    seedFile: "cabo-verde-saudi-arabia-full.sql",
    mockFile: "mock-cabo-verde-saudi-listings.ts",
    mockExport: "mockCaboVerdeSaudiListings",
    mockIdExport: "CABO_VERDE_SAUDI_EVENT_ID",
  },
  "match-66": {
    slug: "uruguay-vs-spain",
    eventId: "wc-66",
    matchNumber: "66",
    title: "Uruguay vs Spain",
    subtitle: "Match 66 · Group H · World Cup 2026",
    description:
      "FIFA World Cup 2026 group stage at Estadio Akron, Guadalajara. Marketplace listings from reference inventory.",
    eventDate: "2026-06-26",
    eventTime: "18:00",
    venueSlug: "estadio-akron",
    homeTeam: ["uruguay", "Uruguay", "Uruguay"],
    awayTeam: ["spain", "Spain", "Spain"],
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "uruguay-spain-viagogo-listings.mjs",
    seedFile: "uruguay-vs-spain-full.sql",
    mockFile: "mock-uruguay-spain-listings.ts",
    mockExport: "mockUruguaySpainListings",
    mockIdExport: "URUGUAY_SPAIN_EVENT_ID",
  },
  "match-63": {
    slug: "egypt-vs-iran",
    eventId: "wc-63",
    matchNumber: "63",
    title: "Egypt vs IR Iran",
    subtitle: "Match 63 · Group G · World Cup 2026",
    description:
      "FIFA World Cup 2026 group stage at Lumen Field, Seattle. Marketplace listings from reference inventory.",
    eventDate: "2026-06-26",
    eventTime: "20:00",
    venueSlug: "lumen-field",
    homeTeam: ["egypt", "Egypt", "Egypt"],
    awayTeam: ["iran", "IR Iran", "Iran"],
    scarcity: 2,
    seatMap: true,
    featured: false,
    listingsFile: "egypt-iran-viagogo-listings.mjs",
    seedFile: "egypt-vs-iran-full.sql",
    mockFile: "mock-egypt-iran-listings.ts",
    mockExport: "mockEgyptIranListings",
    mockIdExport: "EGYPT_IRAN_EVENT_ID",
  },
  "match-68": {
    slug: "croatia-vs-ghana",
    eventId: "wc-68",
    matchNumber: "68",
    title: "Croatia vs Ghana",
    subtitle: "Match 68 · Group L · World Cup 2026",
    description:
      "FIFA World Cup 2026 group stage at Lincoln Financial Field, Philadelphia. Marketplace listings from reference inventory.",
    eventDate: "2026-06-27",
    eventTime: "17:00",
    venueSlug: "lincoln-financial-field",
    homeTeam: ["croatia", "Croatia", "Croatia"],
    awayTeam: ["ghana", "Ghana", "Ghana"],
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "croatia-ghana-viagogo-listings.mjs",
    seedFile: "croatia-vs-ghana-full.sql",
    mockFile: "mock-croatia-ghana-listings.ts",
    mockExport: "mockCroatiaGhanaListings",
    mockIdExport: "CROATIA_GHANA_EVENT_ID",
  },
  "match-80": {
    slug: "world-cup-match-80",
    eventId: "wc-80",
    matchNumber: "80",
    title: "Group L winners vs Group E/H/I/J/K third place",
    subtitle: "Round of 32 · Match 80 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Round of 32 at Mercedes-Benz Stadium, Atlanta. Marketplace listings from reference inventory.",
    eventDate: "2026-07-01",
    eventTime: "12:00",
    venueSlug: "mercedes-benz-stadium",
    tbd: true,
    homeTeamLabel: "Group L winners",
    awayTeamLabel: "Group E/H/I/J/K third place",
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-80-viagogo-listings.mjs",
    seedFile: "world-cup-match-80-full.sql",
    mockFile: "mock-world-cup-match-80-listings.ts",
    mockExport: "mockWorldCupMatch80Listings",
    mockIdExport: "WORLD_CUP_MATCH_80_EVENT_ID",
  },
  "match-81": {
    slug: "world-cup-match-81",
    eventId: "wc-81",
    matchNumber: "81",
    title: "Group D winners vs Group B/E/F/I/J third place",
    subtitle: "Round of 32 · Match 81 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Round of 32 at Levi's Stadium, Santa Clara. Marketplace listings from reference inventory.",
    eventDate: "2026-07-01",
    eventTime: "17:00",
    venueSlug: "levis-stadium",
    tbd: true,
    homeTeamLabel: "Group D winners",
    awayTeamLabel: "Group B/E/F/I/J third place",
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-81-viagogo-listings.mjs",
    seedFile: "world-cup-match-81-full.sql",
    mockFile: "mock-world-cup-match-81-listings.ts",
    mockExport: "mockWorldCupMatch81Listings",
    mockIdExport: "WORLD_CUP_MATCH_81_EVENT_ID",
  },
  "match-82": {
    slug: "world-cup-match-82",
    eventId: "wc-82",
    matchNumber: "82",
    title: "Group G winners vs Group A/E/H/I/J third place",
    subtitle: "Round of 32 · Match 82 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Round of 32 at Lumen Field, Seattle. Marketplace listings from reference inventory.",
    eventDate: "2026-07-01",
    eventTime: "13:00",
    venueSlug: "lumen-field",
    tbd: true,
    homeTeamLabel: "Group G winners",
    awayTeamLabel: "Group A/E/H/I/J third place",
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-82-viagogo-listings.mjs",
    seedFile: "world-cup-match-82-full.sql",
    mockFile: "mock-world-cup-match-82-listings.ts",
    mockExport: "mockWorldCupMatch82Listings",
    mockIdExport: "WORLD_CUP_MATCH_82_EVENT_ID",
  },
  "match-83": {
    slug: "world-cup-match-83",
    eventId: "wc-83",
    matchNumber: "83",
    title: "Group K runners-up vs Group L runners-up",
    subtitle: "Round of 32 · Match 83 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Round of 32 at BMO Field, Toronto. Marketplace listings from reference inventory.",
    eventDate: "2026-07-02",
    eventTime: "19:00",
    venueSlug: "bmo-field",
    tbd: true,
    homeTeamLabel: "Group K runners-up",
    awayTeamLabel: "Group L runners-up",
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-83-viagogo-listings.mjs",
    seedFile: "world-cup-match-83-full.sql",
    mockFile: "mock-world-cup-match-83-listings.ts",
    mockExport: "mockWorldCupMatch83Listings",
    mockIdExport: "WORLD_CUP_MATCH_83_EVENT_ID",
  },
  "match-84": {
    slug: "world-cup-match-84",
    eventId: "wc-84",
    matchNumber: "84",
    title: "Group H winners vs Group J runners-up",
    subtitle: "Round of 32 · Match 84 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Round of 32 at SoFi Stadium, Inglewood. Marketplace listings from reference inventory.",
    eventDate: "2026-07-02",
    eventTime: "12:00",
    venueSlug: "sofi-stadium",
    tbd: true,
    homeTeamLabel: "Group H winners",
    awayTeamLabel: "Group J runners-up",
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-84-viagogo-listings.mjs",
    seedFile: "world-cup-match-84-full.sql",
    mockFile: "mock-world-cup-match-84-listings.ts",
    mockExport: "mockWorldCupMatch84Listings",
    mockIdExport: "WORLD_CUP_MATCH_84_EVENT_ID",
  },
  "match-85": {
    slug: "world-cup-match-85",
    eventId: "wc-85",
    matchNumber: "85",
    title: "Switzerland vs 3E/F/G/I/J",
    subtitle: "Round of 32 · Match 85 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Round of 32 at BC Place Stadium, Vancouver. Marketplace listings from reference inventory.",
    eventDate: "2026-07-02",
    eventTime: "20:00",
    venueSlug: "bc-place-stadium",
    tbd: true,
    homeTeamLabel: "Switzerland",
    awayTeamLabel: "3E/F/G/I/J third place",
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-85-viagogo-listings.mjs",
    seedFile: "world-cup-match-85-full.sql",
    mockFile: "mock-world-cup-match-85-listings.ts",
    mockExport: "mockWorldCupMatch85Listings",
    mockIdExport: "WORLD_CUP_MATCH_85_EVENT_ID",
  },
  "match-88": {
    slug: "world-cup-match-88",
    eventId: "wc-88",
    matchNumber: "88",
    title: "Australia vs 2G",
    subtitle: "Round of 32 · Match 88 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Round of 32 at AT&T Stadium, Arlington. Marketplace listings from reference inventory.",
    eventDate: "2026-07-03",
    eventTime: "13:00",
    venueSlug: "att-stadium",
    tbd: true,
    homeTeamLabel: "Australia",
    awayTeamLabel: "2G",
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-88-viagogo-listings.mjs",
    seedFile: "world-cup-match-88-full.sql",
    mockFile: "mock-world-cup-match-88-listings.ts",
    mockExport: "mockWorldCupMatch88Listings",
    mockIdExport: "WORLD_CUP_MATCH_88_EVENT_ID",
  },
  "match-86": {
    slug: "world-cup-match-86",
    eventId: "wc-86",
    matchNumber: "86",
    title: "Argentina vs 2H",
    subtitle: "Round of 32 · Match 86 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Round of 32 at Hard Rock Stadium, Miami Gardens. Marketplace listings from reference inventory.",
    eventDate: "2026-07-03",
    eventTime: "18:00",
    venueSlug: "hard-rock-stadium",
    tbd: true,
    homeTeamLabel: "Argentina",
    awayTeamLabel: "2H",
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-86-viagogo-listings.mjs",
    seedFile: "world-cup-match-86-full.sql",
    mockFile: "mock-world-cup-match-86-listings.ts",
    mockExport: "mockWorldCupMatch86Listings",
    mockIdExport: "WORLD_CUP_MATCH_86_EVENT_ID",
  },
  "match-87": {
    slug: "world-cup-match-87",
    eventId: "wc-87",
    matchNumber: "87",
    title: "1K vs 3D/E/I/J/L",
    subtitle: "Round of 32 · Match 87 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Round of 32 at GEHA Field at Arrowhead Stadium, Kansas City. Marketplace listings from reference inventory.",
    eventDate: "2026-07-03",
    eventTime: "20:30",
    venueSlug: "arrowhead-stadium",
    tbd: true,
    homeTeamLabel: "1K",
    awayTeamLabel: "3D/E/I/J/L third place",
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-87-viagogo-listings.mjs",
    seedFile: "world-cup-match-87-full.sql",
    mockFile: "mock-world-cup-match-87-listings.ts",
    mockExport: "mockWorldCupMatch87Listings",
    mockIdExport: "WORLD_CUP_MATCH_87_EVENT_ID",
  },
  "match-89": {
    slug: "world-cup-match-89",
    eventId: "wc-89",
    matchNumber: "89",
    title: "W74 vs W77",
    subtitle: "Round of 16 · Match 89 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Round of 16 at Lincoln Financial Field, Philadelphia. Marketplace listings from reference inventory.",
    eventDate: "2026-07-04",
    eventTime: "17:00",
    venueSlug: "lincoln-financial-field",
    tbd: true,
    homeTeamLabel: "W74",
    awayTeamLabel: "W77",
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-89-viagogo-listings.mjs",
    seedFile: "world-cup-match-89-full.sql",
    mockFile: "mock-world-cup-match-89-listings.ts",
    mockExport: "mockWorldCupMatch89Listings",
    mockIdExport: "WORLD_CUP_MATCH_89_EVENT_ID",
  },
  "match-90": {
    slug: "world-cup-match-90",
    eventId: "wc-90",
    matchNumber: "90",
    title: "W73 vs W75",
    subtitle: "Round of 16 · Match 90 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Round of 16 at NRG Stadium, Houston. Marketplace listings from reference inventory.",
    eventDate: "2026-07-04",
    eventTime: "12:00",
    venueSlug: "nrg-stadium",
    tbd: true,
    homeTeamLabel: "W73",
    awayTeamLabel: "W75",
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-90-viagogo-listings.mjs",
    seedFile: "world-cup-match-90-full.sql",
    mockFile: "mock-world-cup-match-90-listings.ts",
    mockExport: "mockWorldCupMatch90Listings",
    mockIdExport: "WORLD_CUP_MATCH_90_EVENT_ID",
  },
  "match-91": {
    slug: "world-cup-match-91",
    eventId: "wc-91",
    matchNumber: "91",
    title: "W76 vs W78",
    subtitle: "Round of 16 · Match 91 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Round of 16 at MetLife Stadium, East Rutherford. Marketplace listings from reference inventory.",
    eventDate: "2026-07-05",
    eventTime: "16:00",
    venueSlug: "metlife-stadium",
    tbd: true,
    homeTeamLabel: "W76",
    awayTeamLabel: "W78",
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-91-viagogo-listings.mjs",
    seedFile: "world-cup-match-91-full.sql",
    mockFile: "mock-world-cup-match-91-listings.ts",
    mockExport: "mockWorldCupMatch91Listings",
    mockIdExport: "WORLD_CUP_MATCH_91_EVENT_ID",
  },
  "match-92": {
    slug: "world-cup-match-92",
    eventId: "wc-92",
    matchNumber: "92",
    title: "W79 vs W80",
    subtitle: "Round of 16 · Match 92 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Round of 16 at Estadio Azteca, Mexico City. Marketplace listings from reference inventory.",
    eventDate: "2026-07-05",
    eventTime: "18:00",
    venueSlug: "estadio-azteca",
    tbd: true,
    homeTeamLabel: "W79",
    awayTeamLabel: "W80",
    scarcity: 2,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-92-viagogo-listings.mjs",
    seedFile: "world-cup-match-92-full.sql",
    mockFile: "mock-world-cup-match-92-listings.ts",
    mockExport: "mockWorldCupMatch92Listings",
    mockIdExport: "WORLD_CUP_MATCH_92_EVENT_ID",
  },
  "match-93": {
    slug: "world-cup-match-93",
    eventId: "wc-93",
    matchNumber: "93",
    title: "W83 vs W84",
    subtitle: "Round of 16 · Match 93 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Round of 16 at AT&T Stadium, Arlington. Marketplace listings from reference inventory.",
    eventDate: "2026-07-06",
    eventTime: "14:00",
    venueSlug: "att-stadium",
    tbd: true,
    homeTeamLabel: "W83",
    awayTeamLabel: "W84",
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-93-viagogo-listings.mjs",
    seedFile: "world-cup-match-93-full.sql",
    mockFile: "mock-world-cup-match-93-listings.ts",
    mockExport: "mockWorldCupMatch93Listings",
    mockIdExport: "WORLD_CUP_MATCH_93_EVENT_ID",
  },
  "match-94": {
    slug: "world-cup-match-94",
    eventId: "wc-94",
    matchNumber: "94",
    title: "W81 vs W82",
    subtitle: "Round of 16 · Match 94 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Round of 16 at Lumen Field, Seattle. Marketplace listings from reference inventory.",
    eventDate: "2026-07-06",
    eventTime: "17:00",
    venueSlug: "lumen-field",
    tbd: true,
    homeTeamLabel: "W81",
    awayTeamLabel: "W82",
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-94-viagogo-listings.mjs",
    seedFile: "world-cup-match-94-full.sql",
    mockFile: "mock-world-cup-match-94-listings.ts",
    mockExport: "mockWorldCupMatch94Listings",
    mockIdExport: "WORLD_CUP_MATCH_94_EVENT_ID",
  },
  "match-95": {
    slug: "world-cup-match-95",
    eventId: "wc-95",
    matchNumber: "95",
    title: "W86 vs W88",
    subtitle: "Round of 16 · Match 95 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Round of 16 at Mercedes-Benz Stadium, Atlanta. Marketplace listings from reference inventory.",
    eventDate: "2026-07-07",
    eventTime: "12:00",
    venueSlug: "mercedes-benz-stadium",
    tbd: true,
    homeTeamLabel: "W86",
    awayTeamLabel: "W88",
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-95-viagogo-listings.mjs",
    seedFile: "world-cup-match-95-full.sql",
    mockFile: "mock-world-cup-match-95-listings.ts",
    mockExport: "mockWorldCupMatch95Listings",
    mockIdExport: "WORLD_CUP_MATCH_95_EVENT_ID",
  },
  "match-96": {
    slug: "world-cup-match-96",
    eventId: "wc-96",
    matchNumber: "96",
    title: "W85 vs W87",
    subtitle: "Round of 16 · Match 96 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Round of 16 at BC Place Stadium, Vancouver. Marketplace listings from reference inventory.",
    eventDate: "2026-07-07",
    eventTime: "13:00",
    venueSlug: "bc-place-stadium",
    tbd: true,
    homeTeamLabel: "W85",
    awayTeamLabel: "W87",
    scarcity: 1,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-96-viagogo-listings.mjs",
    seedFile: "world-cup-match-96-full.sql",
    mockFile: "mock-world-cup-match-96-listings.ts",
    mockExport: "mockWorldCupMatch96Listings",
    mockIdExport: "WORLD_CUP_MATCH_96_EVENT_ID",
  },
  "match-97": {
    slug: "world-cup-match-97",
    eventId: "wc-97",
    matchNumber: "97",
    title: "W89 vs W90",
    subtitle: "Quarterfinal · Match 97 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Quarterfinal at Gillette Stadium, Foxborough. Marketplace listings from reference inventory.",
    eventDate: "2026-07-09",
    eventTime: "16:00",
    venueSlug: "gillette-stadium",
    tbd: true,
    homeTeamLabel: "W89",
    awayTeamLabel: "W90",
    scarcity: 4,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-97-viagogo-listings.mjs",
    seedFile: "world-cup-match-97-full.sql",
    mockFile: "mock-world-cup-match-97-listings.ts",
    mockExport: "mockWorldCupMatch97Listings",
    mockIdExport: "WORLD_CUP_MATCH_97_EVENT_ID",
  },
  "match-98": {
    slug: "world-cup-qf-match-98",
    eventId: "wc-98",
    matchNumber: "98",
    title: "W93 vs W94",
    subtitle: "Quarterfinal · Match 98 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Quarterfinal at SoFi Stadium, Inglewood. Marketplace listings from reference inventory.",
    eventDate: "2026-07-10",
    eventTime: "12:00",
    venueSlug: "sofi-stadium",
    tbd: true,
    homeTeamLabel: "W93",
    awayTeamLabel: "W94",
    scarcity: 3,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-98-viagogo-listings.mjs",
    seedFile: "world-cup-match-98-full.sql",
    mockFile: "mock-world-cup-match-98-listings.ts",
    mockExport: "mockWorldCupMatch98Listings",
    mockIdExport: "WORLD_CUP_MATCH_98_EVENT_ID",
  },
  "match-99": {
    slug: "world-cup-match-99",
    eventId: "wc-99",
    matchNumber: "99",
    title: "W91 vs W92",
    subtitle: "Quarterfinal · Match 99 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Quarterfinal at Hard Rock Stadium, Miami Gardens. Marketplace listings from reference inventory.",
    eventDate: "2026-07-11",
    eventTime: "17:00",
    venueSlug: "hard-rock-stadium",
    tbd: true,
    homeTeamLabel: "W91",
    awayTeamLabel: "W92",
    scarcity: 3,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-99-viagogo-listings.mjs",
    seedFile: "world-cup-match-99-full.sql",
    mockFile: "mock-world-cup-match-99-listings.ts",
    mockExport: "mockWorldCupMatch99Listings",
    mockIdExport: "WORLD_CUP_MATCH_99_EVENT_ID",
  },
  "match-100": {
    slug: "world-cup-match-100",
    eventId: "wc-100",
    matchNumber: "100",
    title: "W95 vs W96",
    subtitle: "Quarterfinal · Match 100 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Quarterfinal at GEHA Field at Arrowhead Stadium, Kansas City. Marketplace listings from reference inventory.",
    eventDate: "2026-07-11",
    eventTime: "20:00",
    venueSlug: "arrowhead-stadium",
    tbd: true,
    homeTeamLabel: "W95",
    awayTeamLabel: "W96",
    scarcity: 4,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-100-viagogo-listings.mjs",
    seedFile: "world-cup-match-100-full.sql",
    mockFile: "mock-world-cup-match-100-listings.ts",
    mockExport: "mockWorldCupMatch100Listings",
    mockIdExport: "WORLD_CUP_MATCH_100_EVENT_ID",
  },
  "match-101": {
    slug: "world-cup-match-101",
    eventId: "wc-101",
    matchNumber: "101",
    title: "W97 vs W98",
    subtitle: "Semifinal · Match 101 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Semifinal at AT&T Stadium, Arlington. Marketplace listings from reference inventory.",
    eventDate: "2026-07-14",
    eventTime: "14:00",
    venueSlug: "att-stadium",
    tbd: true,
    homeTeamLabel: "W97",
    awayTeamLabel: "W98",
    scarcity: 3,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-101-viagogo-listings.mjs",
    seedFile: "world-cup-match-101-full.sql",
    mockFile: "mock-world-cup-match-101-listings.ts",
    mockExport: "mockWorldCupMatch101Listings",
    mockIdExport: "WORLD_CUP_MATCH_101_EVENT_ID",
  },
  "match-102": {
    slug: "world-cup-match-102",
    eventId: "wc-102",
    matchNumber: "102",
    title: "W99 vs W100",
    subtitle: "Semifinal · Match 102 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Semifinal at Mercedes-Benz Stadium, Atlanta. Marketplace listings from reference inventory.",
    eventDate: "2026-07-15",
    eventTime: "15:00",
    venueSlug: "mercedes-benz-stadium",
    tbd: true,
    homeTeamLabel: "W99",
    awayTeamLabel: "W100",
    scarcity: 4,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-102-viagogo-listings.mjs",
    seedFile: "world-cup-match-102-full.sql",
    mockFile: "mock-world-cup-match-102-listings.ts",
    mockExport: "mockWorldCupMatch102Listings",
    mockIdExport: "WORLD_CUP_MATCH_102_EVENT_ID",
  },
  "match-103": {
    slug: "world-cup-match-103",
    eventId: "wc-103",
    matchNumber: "103",
    title: "World Cup Third Place Playoff",
    subtitle: "Third Place · Match 103 · World Cup 2026",
    description:
      "FIFA World Cup 2026 Third Place at Hard Rock Stadium, Miami Gardens. Marketplace listings from reference inventory.",
    eventDate: "2026-07-18",
    eventTime: "17:00",
    venueSlug: "hard-rock-stadium",
    tbd: true,
    homeTeamLabel: "Loser Match 101",
    awayTeamLabel: "Loser Match 102",
    scarcity: 2,
    seatMap: true,
    featured: false,
    listingsFile: "world-cup-match-103-viagogo-listings.mjs",
    seedFile: "world-cup-match-103-full.sql",
    mockFile: "mock-world-cup-match-103-listings.ts",
    mockExport: "mockWorldCupMatch103Listings",
    mockIdExport: "WORLD_CUP_MATCH_103_EVENT_ID",
  },
  "match-104": {
    slug: "world-cup-final-match-104",
    eventId: "wc-104",
    matchNumber: "104",
    title: "World Cup Final",
    subtitle: "Match 104 · TBD vs TBD · FIFA World Cup 2026",
    description:
      "FIFA World Cup 2026 Final at MetLife Stadium, East Rutherford. Marketplace listings from reference inventory.",
    eventDate: "2026-07-19",
    eventTime: "15:00",
    venueSlug: "metlife-stadium",
    tbd: true,
    homeTeamLabel: "Winner Match 101",
    awayTeamLabel: "Winner Match 102",
    scarcity: 3,
    seatMap: true,
    featured: true,
    imageUrl: "/images/events/match-104.jpg",
    listingsFile: "world-cup-match-104-viagogo-listings.mjs",
    seedFile: "world-cup-match-104-full.sql",
    mockFile: "mock-world-cup-match-104-listings.ts",
    mockExport: "mockWorldCupMatch104Listings",
    mockIdExport: "WORLD_CUP_MATCH_104_EVENT_ID",
  },
};

function frontrowlyPrice(marketNow) {
  return Math.round(marketNow * 90) / 100;
}

function sqlStr(s) {
  return s == null ? "NULL" : `'${String(s).replace(/'/g, "''")}'`;
}

function sqlArr(arr) {
  if (!arr?.length) return "ARRAY[]::TEXT[]";
  return `ARRAY[${arr.map((x) => sqlStr(x)).join(", ")}]`;
}

function formatListingRow(l, i) {
  const [section, product, row, qty, qtyAvail, marketNow, , perks, badges, viewScore, viewLabel, type] = l;
  const price = frontrowlyPrice(marketNow);
  return `(${sqlStr(section)}, ${sqlStr(row)}, ${sqlStr(product)}, ${sqlStr(type)}, ${qty}, ${qtyAvail}, ${price.toFixed(2)}::DECIMAL, ${marketNow.toFixed(2)}::DECIMAL, 'USD', ${sqlArr(perks)}, ${sqlArr(badges)}, ${viewScore ?? "NULL"}, ${sqlStr(viewLabel)}, ${i})`;
}

function writeListingsMjs(listings, filename, meta) {
  const lines = listings.map((l) => {
    const json = JSON.stringify(l);
    return `  ${json},`;
  });
  const content = `/**
 * ${listings.length} marketplace listings — ${meta.title}
 * Match ${meta.matchNumber} · parsed from viagogo reference paste
 *
 * Fields: section, product, row, qty, qtyAvail, marketNow, compareAt, perks[], badges[], viewScore, viewLabel, type
 */

export const LISTINGS = [
${lines.join("\n")}
];
`;
  writeFileSync(join(__dirname, "data", filename), content, "utf8");
}

function writeSqlSeed(cfg, listings) {
  const marketMin = Math.min(...listings.map((l) => l[5]));
  const minPrice = frontrowlyPrice(marketMin);
  const listingRows = listings.map((l, i) => formatListingRow(l, i)).join(",\n");
  const isTbd = cfg.tbd === true;
  const imageUrl = cfg.imageUrl ?? `/images/events/match-${cfg.matchNumber}.jpg`;

  const teamInsert = isTbd
    ? ""
    : `INSERT INTO teams (slug, name, country) VALUES
  ('${cfg.homeTeam[0]}', '${cfg.homeTeam[1]}', '${cfg.homeTeam[2]}'),
  ('${cfg.awayTeam[0]}', '${cfg.awayTeam[1]}', '${cfg.awayTeam[2]}')
ON CONFLICT (slug) DO NOTHING;

`;

  const eventColumns = isTbd
    ? `  slug, competition_id, home_team_id, away_team_id, venue_id,
  title, subtitle, description, event_date, event_time,
  min_price, currency, featured, seat_map_enabled, scarcity_override, match_number, image_url,
  home_team_label, away_team_label`
    : `  slug, competition_id, home_team_id, away_team_id, venue_id,
  title, subtitle, description, event_date, event_time,
  min_price, currency, featured, seat_map_enabled, scarcity_override, match_number, image_url`;

  const eventSelect = isTbd
    ? `SELECT
  ${sqlStr(cfg.slug)},
  c.id,
  NULL,
  NULL,
  v.id,
  ${sqlStr(cfg.title)},
  ${sqlStr(cfg.subtitle)},
  ${sqlStr(cfg.description)},
  ${sqlStr(cfg.eventDate)},
  ${sqlStr(cfg.eventTime)},
  ${minPrice.toFixed(2)},
  'USD',
  ${cfg.featured},
  ${cfg.seatMap},
  ${cfg.scarcity ?? "NULL"},
  ${sqlStr(cfg.matchNumber)},
  ${sqlStr(imageUrl)},
  ${sqlStr(cfg.homeTeamLabel)},
  ${sqlStr(cfg.awayTeamLabel)}
FROM competitions c, venues v
WHERE c.slug = 'world-cup-2026'
  AND v.slug = ${sqlStr(cfg.venueSlug)}`
    : `SELECT
  ${sqlStr(cfg.slug)},
  c.id,
  ht.id,
  at.id,
  v.id,
  ${sqlStr(cfg.title)},
  ${sqlStr(cfg.subtitle)},
  ${sqlStr(cfg.description)},
  ${sqlStr(cfg.eventDate)},
  ${sqlStr(cfg.eventTime)},
  ${minPrice.toFixed(2)},
  'USD',
  ${cfg.featured},
  ${cfg.seatMap},
  ${cfg.scarcity},
  ${sqlStr(cfg.matchNumber)},
  ${sqlStr(imageUrl)}
FROM competitions c, teams ht, teams at, venues v
WHERE c.slug = 'world-cup-2026'
  AND ht.slug = ${sqlStr(cfg.homeTeam[0])}
  AND at.slug = ${sqlStr(cfg.awayTeam[0])}
  AND v.slug = ${sqlStr(cfg.venueSlug)}`;

  const onConflict = isTbd
    ? `ON CONFLICT (slug) DO UPDATE SET
  seat_map_enabled = EXCLUDED.seat_map_enabled,
  scarcity_override = EXCLUDED.scarcity_override,
  min_price = EXCLUDED.min_price,
  subtitle = EXCLUDED.subtitle,
  match_number = EXCLUDED.match_number,
  home_team_label = EXCLUDED.home_team_label,
  away_team_label = EXCLUDED.away_team_label;`
    : `ON CONFLICT (slug) DO UPDATE SET
  seat_map_enabled = EXCLUDED.seat_map_enabled,
  scarcity_override = EXCLUDED.scarcity_override,
  min_price = EXCLUDED.min_price,
  subtitle = EXCLUDED.subtitle,
  match_number = EXCLUDED.match_number;`;

  const sql = `-- ${cfg.title} — full match seed
-- Match ${cfg.matchNumber} · ${cfg.eventDate} · ${cfg.eventTime}
-- ${listings.length} ticket listings · Frontrowly prices = 10% below reference market
-- Safe to re-run (clears prior listings for this event, then inserts)

ALTER TABLE events ADD COLUMN IF NOT EXISTS seat_map_enabled BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS scarcity_override INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS match_number TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS home_team_label TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS away_team_label TEXT;
ALTER TABLE ticket_listings ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(12, 2);

${teamInsert}INSERT INTO events (
${eventColumns}
)
${eventSelect}
${onConflict}

DELETE FROM ticket_listings
WHERE event_id = (SELECT id FROM events WHERE slug = '${cfg.slug}');

INSERT INTO ticket_listings (
  event_id, section_number, row_label, product_name, listing_type,
  quantity, quantity_available, price, compare_at_price,
  currency, perks, badges, view_score, view_label, sort_order
)
SELECT
  e.id,
  v.section_number,
  v.row_label,
  v.product_name,
  v.listing_type,
  v.quantity,
  v.quantity_available,
  v.price,
  v.compare_at_price,
  v.currency,
  v.perks,
  v.badges,
  v.view_score,
  v.view_label,
  v.sort_order
FROM events e
CROSS JOIN (VALUES
${listingRows}
) AS v(section_number, row_label, product_name, listing_type, quantity, quantity_available, price, compare_at_price, currency, perks, badges, view_score, view_label, sort_order)
WHERE e.slug = '${cfg.slug}';
`;

  writeFileSync(join(root, "supabase", "seed", cfg.seedFile), sql, "utf8");
  return { minPrice, count: listings.length };
}

function writeMockTs(cfg, listings) {
  const rows = listings.map((l) => {
    const [section, product, row, qty, qtyAvail, marketNow, , perks, badges, viewScore, viewLabel, type] = l;
    const parts = [
      section == null ? "null" : JSON.stringify(section),
      product == null ? "null" : JSON.stringify(product),
      row == null ? "null" : JSON.stringify(row),
      qty,
      qtyAvail,
      marketNow,
      JSON.stringify(perks),
      JSON.stringify(badges),
      viewScore == null ? "null" : viewScore,
      viewLabel == null ? "null" : JSON.stringify(viewLabel),
      JSON.stringify(type),
    ];
    return `  [${parts.join(", ")}],`;
  });

  const content = `import type { TicketListing } from "@/types/database";
import { frontrowlyCompareAt, frontrowlyPrice } from "@/lib/pricing/frontrowly-price";

const EVENT_ID = "${cfg.eventId}";

type Row = [
  string | null,
  string | null,
  string | null,
  number,
  number,
  number,
  string[],
  string[],
  number | null,
  string | null,
  TicketListing["listing_type"],
];

const RAW: Row[] = [
${rows.join("\n")}
];

function toListing(row: Row, index: number): TicketListing {
  const [section, product, rowLabel, qty, qtyAvail, marketNow, perks, badges, viewScore, viewLabel, type] = row;
  return {
    id: \`l\${index + 1}\`,
    event_id: EVENT_ID,
    section_id: null,
    section_number: section,
    row_label: rowLabel,
    product_name: product,
    listing_type: type,
    quantity: qty,
    quantity_available: qtyAvail,
    price: frontrowlyPrice(marketNow),
    compare_at_price: frontrowlyCompareAt(marketNow),
    currency: "USD",
    perks,
    badges,
    view_score: viewScore,
    view_label: viewLabel,
    status: "available",
    sort_order: index,
  };
}

export const ${cfg.mockExport}: TicketListing[] = RAW.map(toListing);
export const ${cfg.mockIdExport} = EVENT_ID;
`;

  writeFileSync(join(root, "src", "lib", "data", cfg.mockFile), content, "utf8");
}

const matchKey = process.argv[2];
const pastePath = process.argv[3];

if (!matchKey || !pastePath || !MATCHES[matchKey]) {
  console.error("Usage: node scripts/import-viagogo-match.mjs <match-65|match-66> <paste-file>");
  process.exit(1);
}

const cfg = MATCHES[matchKey];
const paste = readFileSync(pastePath, "utf8");
const listings = parseViagogoPaste(paste);

if (!listings.length) {
  console.error("No listings parsed — check paste format");
  process.exit(1);
}

mkdirSync(join(__dirname, "data"), { recursive: true });
writeListingsMjs(listings, cfg.listingsFile, cfg);
const { minPrice, count } = writeSqlSeed(cfg, listings);
writeMockTs(cfg, listings);

console.log(`Parsed ${count} listings (min Frontrowly $${minPrice}) for ${cfg.title}`);
console.log(`  scripts/data/${cfg.listingsFile}`);
console.log(`  supabase/seed/${cfg.seedFile}`);
console.log(`  src/lib/data/${cfg.mockFile}`);
