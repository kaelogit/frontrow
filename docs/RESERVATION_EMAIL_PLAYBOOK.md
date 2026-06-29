# Frontrowly — Reservation & payment email playbook

Operator doc — how to handle a ticket reservation from first auto-email through payment proof, confirmation, and e-ticket delivery.

Customer-facing from: `FROM_EMAIL` (e.g. `tickets@frontrowly.com`)  
Support: `support@frontrowly.com`  
Admin: `{SITE_URL}/admin/orders`  
Hold window: `48 hours` (`RESERVATION_HOLD_HOURS`) — seats release automatically if unpaid

---

## Rules

1. Email is primary. All payment instructions, proof requests, and ticket delivery go on the same email thread as the customer’s reservation (Reply-To their address). Keep `[REF]` in every subject and body.
2. Phone / WhatsApp = urgent only until payment is in progress — nudge them to check email, or use text for time-sensitive hold warnings. After they pick a payment method, either channel is fine for proof screenshots.
3. Never ask for gift cards, iTunes codes, or crypto to a random wallet outside your official checkout / published receive addresses.
4. Amount is always in USD unless you explicitly quote a converted total in writing. International buyers pay the USD equivalent plus their bank’s FX and wire fees.
5. One payment method per reply — send PAY MENU first; only send PAY DETAILS for the option they choose.
6. Proof before “paid” — customer says “sent” ≠ paid. You need a verifiable receipt (bank confirmation, Wise transfer ID, on-chain tx, etc.) before Mark paid in admin.
7. Admin must match email stage — see [Admin actions](#admin-actions-map) at the bottom.
8. Tone: Warm, professional, excited they chose Frontrowly — not pressure/scam energy. You’re selling real seats to a real event.

| Stage | System / you | Customer sees |
|-------|----------------|---------------|
| 0 | Site auto-email | “Reservation received” |
| 1 | You (≤24h) | Welcome + excitement + PAY MENU |
| 2 | They pick A–G | You send PAY DETAILS for one method |
| 3 | They pay + proof | Hold → verify → Mark paid |
| 4 | You | Payment confirmed + what’s next |
| 5 | You | E-ticket email + Mark ticket sent |
| 6 | Optional | Day-of / post-event check-in |

---

## What the site does automatically (Step 0)

When someone submits Request reservation on checkout:

1. Order created — status `reservation_requested`, hold until `reserved_until` (+48h).
2. Inventory held (listing or category) — if seats are gone, checkout fails with 409.
3. Email to customer — “Reservation received” (`buildReservationCustomerEmail`).
4. Email to admin — new reservation alert (`ADMIN_EMAIL`).
5. Customer lands on `/order/[REF]/confirmation` — “What happens next” copy.

You do nothing for Step 0 except watch the admin inbox and start Step 1 within 24 hours.

---

## Operator payment sheet (fill once — keep private)

Store real account numbers in a password manager or local sheet, not in git. Paste into PAY DETAILS when needed.

| Code | Method | Best for |
|------|--------|----------|
| A | Zelle (USD) | US customers, same-day |
| B | US bank transfer (ACH / domestic wire) | US customers |
| C | Wise / international transfer | UK, EU, AU, most countries |
| D | SWIFT wire (USD) | Large amounts, banks that need wire |
| E | Crypto — USDC / ETH (EVM) | Crypto-native, fast settlement |
| F | Crypto — BTC | Bitcoin holders |
| G | Crypto — SOL | Solana holders |

| Field | Your value |
|-------|------------|
| Zelle | `[ZELLE EMAIL OR PHONE]` |
| US bank — account name | `[BENEFICIARY NAME]` |
| US bank — routing / account | `[ROUTING]` / `[ACCOUNT]` |
| Wise — link or email | `[WISE EMAIL]` |
| SWIFT — bank name | `[BANK]` |
| SWIFT — SWIFT/BIC | `[SWIFT]` |
| SWIFT — IBAN or account | `[ACCOUNT]` |
| SWIFT — beneficiary address | `[ADDRESS]` |
| EVM receive address | `CRYPTO_RECEIVE_ADDRESS_EVM` env |
| BTC address | `CRYPTO_RECEIVE_ADDRESS_BTC` env |
| SOL address | `CRYPTO_RECEIVE_ADDRESS_SOL` env |

Memo / reference on every payment: `FR-[REF]` or full `[REF]` (e.g. `FR-2026-ABC123`)

---

# STEP 1 — Welcome + payment menu (you send within 24h)

*After admin notification or when you open the order in admin.*

Optional hold line (if you need a few hours to prepare):
```
Hi [First Name],

Thank you for reserving with Frontrowly — we're excited you're joining us for [Event title]!

I'm preparing your payment options for order [REF] and will email you shortly (within a few hours).

Best,
[Your name]
Frontrowly
support@frontrowly.com
```

Email 1 — Subject: Your Frontrowly reservation — payment options — [REF]

```
Hi [First Name],

Thank you for choosing Frontrowly — we're genuinely excited you'll be at [Event title]!

Your seats are on hold for 48 hours while you complete payment.

Order reference: [REF]
Event: [Event title]
Date: [Event date]
Venue: [Venue, city]
Tickets: [Section / row / qty summary]
Total due: $[TOTAL] USD

Please reply to this email with the letter of the payment option that works best for you. We'll send official payment details for that option only.

── Payment options ──

A) Zelle (USD) — fastest for most US bank accounts
B) US bank transfer (ACH or domestic wire)
C) Wise / international transfer — recommended if you're outside the US
D) SWIFT wire (USD) — for international bank wires (may take 2–5 business days)
E) Crypto — USDC or ETH on Ethereum (or network we support)
F) Crypto — Bitcoin (BTC)
G) Crypto — Solana (SOL)

Notes for international customers:
• You may pay from any country; the amount due is always $[TOTAL] USD.
• Your bank or Wise may add conversion fees — those are on top of our ticket total.
• Use the exact reference [REF] on the transfer so we can match your payment quickly.

Your confirmation page (order summary): [CONFIRMATION_URL]

Questions? Reply here or email support@frontrowly.com with [REF] in the subject.

We can't wait to get you to the match!

[Your name]
Frontrowly
```

Text / WhatsApp nudge (optional, if they gave a phone):
```
Hi [First Name], Frontrowly here. We sent payment options for your [Event] tickets (ref [REF]) to [their email]. Please check inbox/spam and reply with A–G for your preferred payment method. Hold is 48 hours. — Frontrowly
```

Admin: Order stays `reservation_requested`. No button yet.

---

# STEP 2 — They pick a method → PAY DETAILS

*They reply e.g. "C" or "Wise" or "I'm in the UK". Send ONE block only.*

Intro (paste before details):
```
Hi [First Name],

Here are your official payment details for option [X] — order [REF].

Amount: $[TOTAL] USD exactly
Reference / memo (required): [REF]

[DETAILS BLOCK BELOW]

When payment is sent, reply to this email with:
• PAYMENT SENT in the subject or body, and
• A screenshot or PDF of your bank/Wise/crypto confirmation showing amount, date, and reference.

If your bank shows a different amount in local currency, that's fine — we need to see $[TOTAL] USD equivalent sent and [REF] in the memo.

[Your name]
Frontrowly
```

### A — Zelle (US)
```
Zelle
Send exactly: $[TOTAL] USD
To: [ZELLE EMAIL OR PHONE]
Memo/note: [REF]

Reply with a screenshot of the Zelle confirmation screen.
```

### B — US bank transfer
```
US bank transfer (ACH or domestic wire)
Amount: $[TOTAL] USD exactly
Beneficiary: [BENEFICIARY NAME]
Bank: [BANK NAME]
Routing (ACH/wire): [ROUTING]
Account: [ACCOUNT]
Reference: [REF]

ACH often clears in 1–3 business days; domestic wire usually same day if sent before bank cut-off.
Reply with bank confirmation showing amount, date, and reference.
```

### C — Wise (international — recommended)
```
Wise transfer
Amount to send: $[TOTAL] USD (or equivalent — Wise will show FX)
Send to: [WISE EMAIL] or use Wise request link: [WISE LINK IF YOU USE ONE]
Reference: [REF]

Wise is usually the cheapest way to pay from the UK, EU, Canada, Australia, and many other countries.
Reply with Wise transfer receipt PDF or screenshot including transfer ID.
```

### D — SWIFT wire (international)
```
SWIFT wire (USD)
Amount: $[TOTAL] USD exactly
Beneficiary: [BENEFICIARY NAME]
Bank: [BANK NAME]
SWIFT/BIC: [SWIFT]
Account / IBAN: [ACCOUNT OR IBAN]
Beneficiary address: [ADDRESS]
Wire reference: [REF]

Important for international wires:
• Your bank may charge $15–50 outgoing wire fee; intermediary banks may deduct additional fees.
• Wires often take 2–5 business days. Your 48-hour hold may need an extension — tell us if you initiated payment before the deadline.
• Sender name on the wire should match [Customer full name] on the order.

Reply with wire receipt or SWIFT confirmation when initiated.
```

### E — Crypto USDC / ETH
```
Crypto (USDC or ETH)
Amount: $[TOTAL] USD equivalent at time of send (we will confirm on receipt)
Network: [Ethereum / specify network]
Send to: [EVM ADDRESS FROM ENV]
Reference: include [REF] in an on-chain memo if your wallet supports it; always email us the transaction hash.

Reply PAYMENT SENT with the transaction hash (0x...) and screenshot from your wallet.
```

### F — Crypto BTC
```
Bitcoin (BTC)
Amount: $[TOTAL] USD equivalent (we confirm BTC amount at send time — ask us if you need exact BTC quote)
Send to: [BTC ADDRESS]
Reference: email us the txid after broadcast

Reply with transaction ID and screenshot.
```

### G — Crypto SOL
```
Solana (SOL)
Amount: $[TOTAL] USD equivalent
Send to: [SOL ADDRESS]
Reply with Solana transaction signature and screenshot.
```

After sending PAY DETAILS — admin: Click Confirm payment (`reservation_requested` → `pending_payment`). This signals they’re in the payment window.

---

# STEP 3 — They reply PAYMENT SENT + proof

Hold message (send immediately):
```
Hi [First Name],

Thank you — we received your payment notice for [REF].

We're verifying your payment with our finance team now. This usually takes a few hours for Zelle/Wise/crypto, and 1–3 business days for bank wires.

We'll email you as soon as payment is confirmed and your e-tickets are being prepared.

[Your name]
Frontrowly
```

### Verification checklist (internal — do not skip)

| Check | Pass? |
|-------|-------|
| Amount ≥ $[TOTAL] USD (after fees) | |
| Reference `[REF]` visible on receipt | |
| Sender name matches order (or plausible family/business account — ask if unclear) | |
| Date within hold window (or wire initiated before expiry — see below) | |
| Not a screenshot of "pending" only for wires still in transit | |

If proof is unclear:
```
Hi [First Name],

Thanks for sending that through. For [REF] we need a clearer confirmation showing:
• $[TOTAL] USD (or equivalent sent)
• Date of transfer
• Reference [REF] in the memo/description

Please reply with a full screenshot or PDF from your bank, Wise, or wallet.

[Your name]
Frontrowly
```

If wrong amount (underpaid):
```
Hi [First Name],

We received $[AMOUNT RECEIVED] for order [REF]. The total due is $[TOTAL] USD.

Please send the remaining $[DIFFERENCE] using the same method and reference [REF], or reply if you'd like to adjust the order.

[Your name]
Frontrowly
```

If hold expired but wire was already initiated:
```
Hi [First Name],

Your 48-hour hold on [REF] expired, but we see you initiated a wire on [DATE]. We're holding verification on our side — once the wire clears we will confirm or release seats within 24 hours of funds arriving.

[Your name]
Frontrowly
```
*Admin: use Extend hold 48h if still `pending_payment` and seats may have been released — check inventory.*

If seats were released (order `expired`):
```
Hi [First Name],

Unfortunately the hold on [REF] expired before we could confirm payment and those seats returned to inventory.

Reply ASAP — we will check if the same seats are still available or offer alternatives for [Event].

[Your name]
Frontrowly
```

---

# STEP 4 — Payment confirmed

*After verification — admin: Mark paid (`pending_payment` → `paid`). Inventory finalized.*

Email 4 — Subject: Payment confirmed — [REF] — [Event title]

```
Hi [First Name],

Great news — we've confirmed your payment for order [REF]!

Event: [Event title]
Date: [Event date]
Venue: [Venue]
Tickets: [Summary]
Amount received: $[TOTAL] USD

Your e-tickets will be emailed to [customer email] within [24 hours / specify]. You'll receive a separate message with your mobile/printable tickets and entry instructions.

Order page: [CONFIRMATION_URL]

Important for match day:
• Bring the ticket on your phone or printed per venue policy
• Arrive early — World Cup venues have enhanced security
• Name on the ticket should match ID where the venue requires it

Thank you for booking with Frontrowly — we can't wait for you to experience [Event title]!

[Your name]
Frontrowly
```

---

# STEP 5 — E-ticket delivery

*Admin: Send ticket (`paid` → `ticket_issued`) — triggers `sendTicketEmail` if wired, or send manually.*

Email 5 — Subject: Your tickets — [REF] — [Event title]

```
Hi [First Name],

Your e-tickets for [Event title] are attached / linked below.

Order reference: [REF]
Event: [Event date] · [Venue]
Seats: [Section, row, seats]

[ATTACH PDF / LINK TO TICKET PLATFORM / TRANSFER INSTRUCTIONS]

Entry tips:
• [Venue-specific notes if any]
• Keep this email accessible offline at the stadium

Need help? support@frontrowly.com — include [REF].

Enjoy the match!
[Your name]
Frontrowly
```

Admin: Mark completed when you're satisfied the file is closed.

---

# STEP 6 — Reminders & edge cases

### Hold expiring — 24h before `reserved_until`

Subject: Reminder — your seat hold expires soon — [REF]

```
Hi [First Name],

Friendly reminder: your hold on [Event title] tickets (ref [REF]) expires in about 24 hours.

Total due: $[TOTAL] USD

If you haven't paid yet, reply with your payment method letter (A–G) or send proof if you already paid.

If you need more time for an international wire, tell us today — we may extend once if payment is already in transit.

[Your name]
Frontrowly
```

### Hold expired (system)

Cron `POST /api/cron/release-holds` sets order `expired` and releases inventory. Send:

```
Hi [First Name],

Your reservation [REF] has expired and the seats were released.

If you still want tickets to [Event], reply and we'll check current availability.

[Your name]
Frontrowly
```

### Customer cancels

```
Hi [First Name],

We've cancelled order [REF] as requested. Any held seats are released.

If your situation changes, we're happy to help you find tickets again.

[Your name]
Frontrowly
```
Admin: Cancel

### "Is this legit?"

```
Hi [First Name],

Fair question. Frontrowly is a ticket marketplace for major live events. Your order [REF] is tied to a real hold on specific seats in our system — you can view it at [CONFIRMATION_URL].

We don't ask for gift cards or payment to random individuals. All payment details come from this official thread (tickets@ / support@frontrowly.com).

We're a reservation-first checkout because many international buyers can't use US card rails — you pay by bank transfer, Wise, or crypto, then we deliver e-tickets.

What specific concern can I address?

[Your name]
Frontrowly
```

### "Why can't I just pay by card?"

```
Hi [First Name],

Card checkout is temporarily unavailable on our site. Reservation + bank/Wise/crypto lets us serve customers worldwide without declining foreign cards.

Your seats are held for 48 hours while you complete payment — same seats, secure reference [REF].

[Your name]
Frontrowly
```

### "I'm not in the US — how do I pay?"

```
Hi [First Name],

Most international customers use option C (Wise) or D (SWIFT wire). Both work from [their country].

Total is always $[TOTAL] USD — your bank converts from local currency. Reply C or D and we'll send step-by-step details.

[Your name]
Frontrowly
```

### Wire still pending after 48h

1. Confirm wire initiated before expiry (proof with timestamp).
2. Admin: Extend hold 48h on `pending_payment`.
3. Email customer that seats remain while wire clears.

### Customer paid wrong reference

Ask for bank proof; match manually in admin notes. If unmatchable, request they contact their bank to add memo or send supplemental transfer with `[REF]`.

---

## Branch diagram (everything that can happen)

```
Reservation submitted (auto)
    │
    ├─► You send Email 1 (PAY MENU) within 24h
    │
    ├─► Customer silent → Reminder at 24h before expiry
    │
    ├─► Customer picks method → PAY DETAILS → admin Confirm payment
    │
    ├─► Customer sends proof
    │       ├─► Clear → Mark paid → Email 4 → Send ticket → Email 5 → Complete
    │       ├─► Unclear → ask for better proof
    │       ├─► Underpaid → ask for difference
    │       └─► Wire pending → Extend hold + wait
    │
    ├─► Hold expires (no payment / no proof)
    │       └─► expired + seats released → win-back email if they still want tickets
    │
    ├─► Customer cancels → admin Cancel + release inventory
    │
    └─► Site crypto checkout (separate path)
            └─► pending_payment → on-chain confirm → paid → tickets
```

---

## Admin actions map

| Customer stage | Order status | You click |
|----------------|--------------|-----------|
| Just reserved (auto emails sent) | `reservation_requested` | — |
| Sent PAY DETAILS, they're paying | `reservation_requested` → Confirm payment | `pending_payment` |
| Verified funds received | `pending_payment` → Mark paid | `paid` |
| E-ticket sent | `paid` → Send ticket | `ticket_issued` |
| Case closed | `ticket_issued` → Mark completed | `completed` |
| Wire in flight, need time | `pending_payment` → Extend hold 48h | stays `pending_payment` |
| Customer backs out | any open → Cancel | `cancelled` |
| Hold timer ran out (cron) | — | `expired` (automatic) |

---

## Subject line cheat sheet

| Step | Subject |
|------|---------|
| 1 | `Your Frontrowly reservation — payment options — [REF]` |
| 2 | `Payment details — [REF] — option [A-G]` |
| 3 hold | `Verifying your payment — [REF]` |
| 4 | `Payment confirmed — [REF] — [Event]` |
| 5 | `Your tickets — [REF] — [Event]` |
| Reminder | `Reminder — seat hold expires soon — [REF]` |
| Expired | `Reservation expired — [REF]` |

---

## Quick links

- Customer confirmation: `{SITE_URL}/order/[REF]/confirmation`
- Admin orders: `{SITE_URL}/admin/orders`
- Terms / refunds: `{SITE_URL}/terms`, `{SITE_URL}/refunds`
- Setup env vars: `docs/SUPABASE_SETUP.md` (`RESEND_API_KEY`, `FROM_EMAIL`, `ADMIN_EMAIL`)

---

*Keep your real bank/crypto credentials in a private operator sheet. This playbook uses placeholders only.*
