/**
 * Parse viagogo listing panel copy into seed rows.
 * Row: [section, product, row, qty, qtyAvail, marketNow, compareAt, perks[], badges[], viewScore, viewLabel, type]
 */

function parseMoney(s) {
  return parseFloat(s.replace(/[$,]/g, ""));
}

function parseQtyLine(line) {
  const m = line.match(/(\d+)\s*-\s*(\d+)\s*tickets?/i);
  if (m) return { qty: parseInt(m[2], 10), qtyAvail: parseInt(m[2], 10), perk: line.trim() };
  const m2 = line.match(/(\d+)\s+tickets?/i);
  if (m2) {
    const n = parseInt(m2[1], 10);
    return { qty: n, qtyAvail: n, perk: `${n} ticket${n > 1 ? "s" : ""} together` };
  }
  const m3 = line.match(/(\d+)\s*ticket/i);
  if (m3) {
    const n = parseInt(m3[1], 10);
    return { qty: n, qtyAvail: n, perk: `${n} ticket${n > 1 ? "s" : ""}` };
  }
  return null;
}

function listingType(section, product) {
  const name = (product ?? section ?? "").toLowerCase();
  if (
    /hospitality|champions club|fifa pavilion|vip|pavilion/i.test(name) ||
    /lounge|suite/i.test(name)
  ) {
    return "hospitality";
  }
  if (/category|supporters|inferior|upper|lower|300-level|400-level|fan zone/i.test(name) && !section?.match(/^\d/)) {
    return "zone";
  }
  return "seat";
}

function splitSectionProduct(raw) {
  const t = raw.trim();
  if (/^category\s+\d/i.test(t)) return { section: null, product: t };
  if (/supporters|hospitality|vip|pavilion|inferior|upper|lower|300-level|400-level|concourse/i.test(t)) {
    return { section: null, product: t };
  }
  if (/^champions club$/i.test(t)) {
    return { section: null, product: t };
  }
  if (/^section\s+/i.test(t)) {
    const inner = t.replace(/^section\s+/i, "").trim();
    if (/^category\s+\d/i.test(inner)) return { section: null, product: inner };
    return { section: inner, product: null };
  }
  return { section: t, product: null };
}

export function parseViagogoPaste(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const skip = new Set([
    "favorite",
    "usd",
    "en",
    "search events, artists, teams and more",
    "sell",
    "my tickets",
    "sign in",
    "only 1% of tickets left",
    "only 2% of tickets left",
    "other ticket options:",
    "filters",
    "number of tickets",
    "1 ticket",
    "price per ticket",
    "sort by",
    "recommended",
    "price",
    "best deal",
    "best view",
    "features",
    "zones",
    "price display options",
    "perks",
    "reset filters",
    "what can we help you find?",
    "top value",
    "cheapest",
    "most discounted",
    "now",
    "incl. fees",
    "viewed",
    "no image available",
    "showing 80 of 80",
    "showing 129 of 131",
    "showing 128 of 129",
    "showing 105 of 108",
    "showing 382 of 387",
    "showing 355 of 364",
    "showing 295 of 303",
    "showing 400 of 401",
    "showing 148 of 148",
    "showing 309 of 312",
    "showing 423 of 427",
    "showing 243 of 246",
    "showing 356 of 358",
    "showing 308 of 310",
    "showing 322 of 327",
    "showing 320 of 320",
    "showing 324 of 327",
    "showing 277 of 280",
    "showing 307 of 308",
    "showing 256 of 256",
    "showing 350 of 353",
    "showing 316 of 316",
    "showing 222 of 224",
    "showing 271 of 271",
    "showing 217 of 219",
    "showing 219 of 219",
    "showing 202 of 203",
    "showing 254 of 254",
    "showing 318 of 318",
    "4010 tickets",
    "view 4010 tickets",
    "3598 tickets",
    "view 3598 tickets",
    "4608 tickets",
    "view 4608 tickets",
    "2773 tickets",
    "view 2773 tickets",
    "3366 tickets",
    "view 3366 tickets",
    "3509 tickets",
    "view 3509 tickets",
    "2885 tickets",
    "view 2885 tickets",
    "4184 tickets",
    "view 4184 tickets",
    "5032 tickets",
    "view 5032 tickets",
    "3575 tickets",
    "view 3575 tickets",
    "5986 tickets",
    "view 5986 tickets",
    "4956 tickets",
    "view 4956 tickets",
    "3646 tickets",
    "view 3646 tickets",
    "4288 tickets",
    "view 4288 tickets",
    "8319 tickets",
    "view 8319 tickets",
    "only 4% of tickets left",
    "search this area",
    "view 5007 tickets",
    "5007 tickets",
    "showing 4478 tickets",
    "4876 tickets",
    "view 4876 tickets",
    "3599 tickets",
    "view 3599 tickets",
    "only 3% of tickets left",
    "bench",
    "seats are guaranteed to be next to each other.",
    "2 tickets",
    "2400 tickets",
    "view 2400 tickets",
    "3431 tickets",
    "view 3431 tickets",
    "sponsored",
  ]);

  const listings = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (
      line.match(/^t\d+-/i) ||
      line.match(/^\d{1,3}$/) ||
      line.match(/^s\d+/i) ||
      line.match(/^ls\d+/i) ||
      line.match(/^cs\d+/i) ||
      line.match(/^gc\d+/i) ||
      line.match(/^lb\d+/i) ||
      line.match(/^fl\d+/i) ||
      line.match(/^l\d{3}$/i) ||
      line.match(/^\d{3}c$/i) ||
      line.match(/^chr\d+/i) ||
      line.match(/^clb\d+/i) ||
      line.match(/^own\d+/i) ||
      line.match(/^es\d+$/i) ||
      line.match(/^3\d{3}$/i) ||
      line.match(/^\d{3}a$/i) ||
      line.match(/^\d{3}\s+a$/i) ||
      line.match(/^field /i) ||
      line.match(/^(home|visitor)$/i) ||
      line.match(/^loge box$/i) ||
      line.match(/ vip$/i) ||
      line.match(/^\d{3}[ab]$/i) ||
      line.match(/^\d+[ewns]{1,2}-\d+/i) ||
      line.match(/^vip\d+/i) ||
      line.match(/^c\d{3}$/i) ||
      line.match(/^\d+[ewns]{1,2}-[a-z]$/i) ||
      line.match(/^c\d+wc$/i) ||
      line.match(/^\d+wc$/i) ||
      line.match(/^3[ewns]{1,2}-[a-z]$/i) ||
      line.match(/^\d+[ab]$/i) ||
      line.match(/^pa\d+$/i) ||
      line.match(/^oc\d+$/i) ||
      line.match(/^rc$/i) ||
      line.match(/^\d+[lr]$/i) ||
      line.match(/^rh\d+$/i) ||
      line.match(/^sv\d+$/i) ||
      line.match(/^ps\d+/i) ||
      line.match(/^rzs\d+/i) ||
      line.match(/^c\d+$/i) ||
      line.match(/^\d{1,2}[lr]$/i) ||
      line.match(/^m\d+[a-z0-9]*$/i) ||
      line.match(/^\d{3}(cc|pt|t)$/i) ||
      line.match(/^liv /i) ||
      line.match(/^(west|east)fc$/i) ||
      line.match(/^fld(nw|ne|se)$/i) ||
      line.match(/^lrb\d*$/i) ||
      line.match(/^\d+lrb$/i) ||
      line.match(/^m420b$/i) ||
      line.match(/^\d+ club$/i) ||
      line.match(/^ss\d+$/i) ||
      line.match(/^bs\d+$/i) ||
      line.match(/^\d{3}[rgc]$/i) ||
      line.match(/^upper$/i) ||
      line.match(/^upper level \d+/i) ||
      line.match(/^mc\d+$/i) ||
      line.match(/^(sw|ne) terrace \d+$/i) ||
      line.match(/^miller lite/i) ||
      line.match(/^field suite/i) ||
      line.match(/^press box$/i) ||
      line.match(/^s\d{3}$/i) ||
      line.match(/^mix$/i) ||
      line.match(/^press$/i) ||
      line.match(/^l\d+-\d+$/i) ||
      line.match(/^cc\d+$/i) ||
      line.match(/^(west mezzanine club|corona beach club|coaches club)$/i) ||
      line.match(/^category \d/i) ||
      line.match(/^sro$/i) ||
      line.match(/^scoreboard$/i) ||
      line.match(/^cl\d+$/i) ||
      line.match(/^b\d+[ab]?$/i) ||
      line.match(/^r\d+[ab]?$/i) ||
      line.match(/^rs\d+$/i) ||
      line.match(/^rn\d+$/i) ||
      line.match(/^pc\d+$/i) ||
      line.match(/^sp \d+$/i) ||
      line.match(/^\d{3}[a-z]+$/i) ||
      line.match(/^(sky light|encore boston|harbour terrace)$/i) ||
      line.match(/^(miller lite|bud light|eagles nest|pitchside|pavilion|fifa|trophy|press|bench|mix|lounge)/i) ||
      line.match(/^other ticket/i) ||
      line.match(/^filters$/i) ||
      line.match(/^US\$/) ||
      line.match(/^view \d+ tickets$/i) ||
      line.match(/^\d+ tickets$/i) ||
      line.match(/^world cup tickets/i) ||
      line.match(/^only \d+% of tickets left$/i) ||
      line.match(/^\d+(\.\d+)?$/) && lines[i + 1]?.match(/^(amazing|great|good)$/i) ||
      (line.match(/^[a-z]{2}$/i) && line.length === 2)
    ) {
      i++;
      continue;
    }

    let venueSection = line.match(/ - Section (.+)$/i);
    let standaloneProduct = null;

    if (!venueSection) {
      const productOnly =
        !line.startsWith("$") &&
        !/^row /i.test(line) &&
        !parseQtyLine(line) &&
        !/^only \d+ left$/i.test(line) &&
        !/^\d+(\.\d+)?$/.test(line) &&
        !/^(amazing|great|good)$/i.test(line) &&
        lines[i + 1] &&
        (parseQtyLine(lines[i + 1]) || /^only \d+ left$/i.test(lines[i + 1]));

      if (productOnly) {
        standaloneProduct = line.replace(/no image available$/i, "").trim();
        i++;
      } else {
        i++;
        continue;
      }
    }

    const { section: sec0, product: prod0 } = venueSection
      ? splitSectionProduct(venueSection[1].replace(/no image available$/i, "").trim())
      : { section: null, product: standaloneProduct };
    if (venueSection) i++;

    let section = sec0;
    let product = prod0;
    let row = null;
    let qty = 1;
    let qtyAvail = 1;
    const perks = [];
    const badges = [];
    let compareAt = null;
    let marketNow = null;
    let viewScore = null;
    let viewLabel = null;

    while (i < lines.length) {
      const l = lines[i];

      if (marketNow != null) {
        const nextProduct =
          !l.match(/ - Section /i) &&
          !l.startsWith("$") &&
          !/^row /i.test(l) &&
          !parseQtyLine(l) &&
          !/^only \d+ left$/i.test(l) &&
          !/^\d+(\.\d+)?$/.test(l) &&
          !/^(amazing|great|good)$/i.test(l) &&
          lines[i + 1] &&
          (parseQtyLine(lines[i + 1]) || /^only \d+ left$/i.test(lines[i + 1]));
        if (nextProduct) break;
      }

      if (l.match(/ - Section .+$/i)) break;
      if (l.match(/^US\$/)) {
        i++;
        continue;
      }
      if (skip.has(l.toLowerCase())) {
        i++;
        continue;
      }

      if (l.match(/^section /i)) {
        if (marketNow != null) break;
        const sp = splitSectionProduct(l);
        section = sp.section ?? section;
        product = sp.product ?? product;
        i++;
        continue;
      }

      if (l.match(/^row /i)) {
        row = l.replace(/^row\s+/i, "").replace(/\s*\|.*$/, "").trim();
        i++;
        continue;
      }

      const qtyParsed = parseQtyLine(l);
      if (qtyParsed && !l.startsWith("$")) {
        qty = qtyParsed.qty;
        qtyAvail = qtyParsed.qtyAvail;
        perks.push(qtyParsed.perk);
        i++;
        continue;
      }

      if (/^only \d+ left$/i.test(l)) {
        const n = parseInt(l.match(/\d+/)[0], 10);
        qtyAvail = Math.min(qtyAvail, n);
        i++;
        continue;
      }

      if (/^best price$/i.test(l)) badges.push("Best price");
      else if (/^fan favorite$/i.test(l)) badges.push("Fan favorite");
      else if (/^best deal$/i.test(l)) badges.push("Best deal");
      else if (/^sponsored$/i.test(l)) badges.push("Sponsored");
      else if (/^last tickets$/i.test(l)) badges.push("Last tickets");
      else if (!l.startsWith("$") && !/^\d+(\.\d+)?$/.test(l) && !/^(amazing|great|good)$/i.test(l)) {
        if (!l.match(/^view \d+/i) && !l.match(/^\d+ tickets$/i)) {
          perks.push(l);
        }
      }

      if (l.startsWith("$")) {
        const price = parseMoney(l);
        if (marketNow == null && compareAt == null) {
          if (lines[i + 1]?.toLowerCase() === "now" && lines[i + 2]?.startsWith("$")) {
            compareAt = price;
            i += 2;
            marketNow = parseMoney(lines[i]);
            i++;
            continue;
          }
          marketNow = price;
        }
      }

      if (/^\d+(\.\d+)?$/.test(l)) {
        viewScore = parseFloat(l);
        if (lines[i + 1] && /^(amazing|great|good)$/i.test(lines[i + 1])) {
          viewLabel = lines[i + 1];
          i += 2;
          continue;
        }
      }

      i++;
      if (marketNow != null && (viewScore != null || i >= lines.length || lines[i].match(/ - Section /i))) {
        break;
      }
    }

    if (marketNow == null) continue;

    const type = listingType(section, product);
    const uniquePerks = [...new Set(perks.filter(Boolean))];
    const uniqueBadges = [...new Set(badges)];

    listings.push([
      section,
      product,
      row,
      qty,
      qtyAvail,
      marketNow,
      compareAt ?? Math.round(marketNow * 1.15),
      uniquePerks.length ? uniquePerks : ["Clear view"],
      uniqueBadges,
      viewScore,
      viewLabel,
      type,
    ]);
  }

  return listings;
}
