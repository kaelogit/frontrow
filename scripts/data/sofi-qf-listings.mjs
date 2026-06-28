/**
 * SoFi Stadium QF listings — Match 98 (world-cup-qf-match-98)
 * Reference pricing: docs/venues/SOFI.md · world-cup-stages quarterfinal tiers
 * Fields: section, product, row, qty, qtyAvail, marketNow, perks[], badges[], viewScore, viewLabel, type
 */

export const SOFI_SECTIONS = [
  ...[201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238].map(
    (n) => ({ num: String(n), level: "200", zone: n >= 208 && n <= 211 ? "cat-1" : "cat-2" })
  ),
  ...[...Array.from({ length: 35 }, (_, i) => 400 + i), ...Array.from({ length: 22 }, (_, i) => 436 + i)].map(
    (n) => ({ num: String(n), level: "400", zone: n >= 412 && n <= 422 ? "cat-2" : "cat-3" })
  ),
  ...[...Array.from({ length: 22 }, (_, i) => 504 + i), ...Array.from({ length: 18 }, (_, i) => 536 + i)].map(
    (n) => ({ num: String(n), level: "500", zone: n >= 543 ? "cat-4" : "cat-3" })
  ),
];

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P"];

/** @type {[string|null, string|null, string|null, number, number, number, string[], string[], number|null, string|null, string][]} */
const HERO = [
  ["543", null, "12", 2, 2, 810, ["Clear view", "2 tickets together"], ["Best price"], 7.8, "Great", "seat"],
  ["227", null, "8", 2, 2, 950, ["Clear view", "2 tickets together"], [], 8.2, "Amazing", "seat"],
  ["412", null, "14", 2, 2, 1400, ["Clear view", "2 tickets together"], ["Fan favorite"], 8.6, "Amazing", "seat"],
  ["208", null, "6", 2, 2, 2800, ["Clear view", "2 tickets together"], ["Fan favorite"], 9.1, "Amazing", "seat"],
  ["543", null, "5", 1, 1, 810, ["Clear view", "1 ticket"], ["Best price"], 7.5, "Great", "seat"],
  ["228", null, "10", 1, 1, 1020, ["Clear view", "1 ticket"], [], 8.0, "Amazing", "seat"],
  ["415", null, "9", 1, 1, 1650, ["Clear view", "1 ticket"], [], 8.4, "Amazing", "seat"],
  ["209", null, "4", 1, 1, 3200, ["Clear view", "Front row of section", "1 ticket"], ["Fan favorite"], 9.3, "Amazing", "seat"],
];

function marketForSection(section, level) {
  const n = parseInt(section, 10);
  if (level === "500") {
    if (n >= 543) return 810 + (n - 543) * 18;
    return 900 + (n - 504) * 12;
  }
  if (level === "400") {
    if (n >= 412 && n <= 422) return 1400 + (n - 412) * 85;
    return 1100 + (n % 17) * 45;
  }
  if (n >= 208 && n <= 211) return 2800 + (n - 208) * 320;
  return 2000 + (n % 12) * 110;
}

function buildListings() {
  const out = [...HERO];
  let i = 0;

  for (const sec of SOFI_SECTIONS) {
    if (HERO.some((h) => h[0] === sec.num)) continue;
    const market = marketForSection(sec.num, sec.level);
    const row = ROWS[i % ROWS.length];
    const qty = i % 5 === 0 ? 1 : 2;
    const qtyAvail = qty === 1 ? 1 : i % 3 === 0 ? 4 : 2;
    const viewScore = sec.level === "200" ? 8.5 + (i % 10) / 20 : sec.level === "400" ? 7.8 + (i % 8) / 20 : 7.2 + (i % 6) / 20;
    const viewLabel = viewScore >= 8.5 ? "Amazing" : viewScore >= 7.8 ? "Great" : "Good";
    const badges = market <= 850 ? ["Best price"] : market >= 3000 ? ["Fan favorite"] : [];
    out.push([
      sec.num,
      null,
      row,
      qty,
      qtyAvail,
      market,
      ["Clear view", `${qty} ticket${qty > 1 ? "s" : ""} together`],
      badges,
      Math.round(viewScore * 10) / 10,
      viewLabel,
      "seat",
    ]);
    i++;
  }

  out.push(
    [null, "Champions Club", null, 2, 2, 8200, ["Hospitality package", "Club access", "2 tickets together"], [], null, null, "hospitality"],
    [null, "Field Club", null, 2, 2, 12400, ["Premium sideline", "Club dining", "2 tickets together"], [], null, null, "hospitality"],
    [null, "Suite Level", null, 4, 4, 18500, ["Private suite", "4 tickets together"], [], null, null, "hospitality"],
    [null, "Category 3", null, 2, 2, 900, ["Clear view", "2 tickets together"], [], 7.6, "Great", "zone"],
    [null, "Category 1", null, 2, 2, 2800, ["Clear view", "2 tickets together"], [], 8.8, "Amazing", "zone"]
  );

  return out.sort((a, b) => a[5] - b[5]);
}

export const SOFI_QF_LISTINGS = buildListings();
