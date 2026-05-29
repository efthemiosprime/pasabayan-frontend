# Copy Deck: Landing Site Update from White Paper

**Status:** Draft copy for review — no HTML/SCSS written yet.
**Companion to:** `SPEC-whitepaper-copy-update.md`
**Rule:** White paper = source of truth (aligns with backend). Marketing tone, consumer-facing.

Legend: ~~strikethrough~~ = current site text to remove · **bold** = new/replacement text.

---

## 1. Phase 0 — Required corrections

### 1.1 Features card "Verified Users"
- Title: ~~Verified Users~~ → **Verified Users**
- Description: ~~ID verification and background checks for all carriers and senders.~~
  → **Every user is verified in tiers — email, then phone, with optional government-ID verification — so you always know who you're dealing with.**

### 1.2 Sender Step 3 ("Secure & Pay") tags
- ~~Money-Back Guarantee~~ → **Refund on Eligible Cancellations**
- Keep: Escrow Protection, Secure Payment
- Description stays accurate: "Book your carrier and pay securely. Your payment is held safely until delivery is confirmed."

### 1.3 Carrier Step 4 ("Deliver & Get Paid")
- Tag: ~~Instant Payout~~ → **Fast Payout**
- Description: ~~Hand over the package, get your delivery code confirmed, and receive instant payment.~~
  → **Hand over the package, get your delivery code confirmed, and your payout is released — straight to your connected account.**

### 1.4 Footer
- ~~© 2025 Pasabayan. All rights reserved.~~ → **© 2026 Pasabayan. All rights reserved.**

### 1.5 Nav (for the new section)
- Add link: **Why Pasabayan** → `#why` (place between "How It Works" and "For Senders")

---

## 2. New section — "Why Pasabayan" (the Story)

**Placement:** after Roles (`#how-it-works`), before Sender journey. Anchor `#why`.

### Section header
- Eyebrow / label: **Our Story**
- Title: **Rooted in Filipino tradition. Built for everyone.**
- Intro paragraph:
  > **Pasabayan is for everyone, everywhere — anyone with something to send and anyone already heading that way.** Its roots are Filipino: for generations, families have sent things home through whoever was making the trip — the *balikbayan* box, the *padala* entrusted to a friend, the *pasabay* handed to someone going the same direction. But the idea behind it isn't Filipino-only — it's universal. Neighbors and travelers helping each other move things, on trust, happens in every community on earth. We inherited the tradition; we built it for all of us. **You don't need to be Filipino to send, to carry, or to belong here.**

### Two-column comparison

**Column A — The informal way**
- Heading: **How it happens today**
- Sub: *Scattered across Facebook groups and chat threads*
- Points:
  - Strangers you can't verify
  - Pay up front and hope it arrives
  - Requests buried in comment threads
  - No proof it was actually delivered
  - Little recourse when something goes wrong

**Column B — The Pasabayan way**
- Heading: **How Pasabayan does it**
- Sub: *The same kindness, made safe for both sides*
- Points:
  - Verified identities on every account
  - Payment held in escrow until delivery is confirmed
  - Structured requests matched to real travelers
  - One-time codes confirm every pickup and delivery
  - In-app chat, refunds, and disputes if plans change

### Closing line (optional, below columns)
> We're not replacing the community instinct that makes *pasabay* work — we're protecting it, and opening it to every community, corridor, and culture. One platform, for everyone on both sides of the exchange.

---

## 3. Trust & Safety grid (re-content existing 6 cards)

**Section header**
- Title: **Built for Trust & Safety**
- Subtitle: **Every delivery is protected end to end — the safeguards an informal arrangement can't give you.**

**Card 1 — Tiered Verification**
> Accounts are verified in steps — email, then phone, with optional government-ID review. The more verified a user is, the more you can trust the handoff.

**Card 2 — Escrow Protection**
> Your payment is held securely and only released to the carrier once delivery is confirmed — never before.

**Card 3 — Confirmed Handoff Codes**
> Every pickup and delivery is sealed with a one-time code. No matching code, no handoff — so there's always proof it actually happened.

**Card 4 — On-Platform Chat & Fraud Detection**
> Coordinate through in-app chat that stays on the record. We flag attempts to move payment off-platform, because staying on Pasabayan is what keeps you protected.

**Card 5 — Two-Sided Reviews**
> Carriers and senders rate each other after every delivery. Good behavior builds a reputation; bad actors become visible to everyone.

**Card 6 — Refunds & Disputes**
> If a delivery goes wrong, structured refund and dispute resolution gives you a clear path to recourse — with our team reviewing the case.

**Small disclosure line (below the grid)**
> Pasabayan is not an insurance provider. Any declared package value is informational only and helps carriers decide what they're comfortable carrying; it does not represent coverage. Carrier responsibility is defined in our Terms.

---

## 4. About / heritage enrichment

**Section title:** Meet the Team (unchanged)

**Mission paragraph** — replace current text with:
> ~~We believe in the power of community to solve everyday problems. Pasabayan was born from the Filipino tradition of "pasabay" — the practice of asking travelers to carry items along their journey. We're bringing this trusted tradition into the digital age.~~
> **We believe in the power of community to solve everyday problems. Pasabayan is inspired by the Filipino tradition of *pasabay* and *padala* — entrusting your things to someone already heading your way — but it was never meant for Filipinos alone. That heritage is our soul, not our boundary. The same trust and reciprocity live in every community, so we built a platform that anyone, anywhere can use. Wherever you're sending, and whoever you are, there's a place for you here.**

---

## 5. Glossary (optional micro-touch)

If you want a small cultural footnote near the Story or About section:
- **Balikbayan box** — the care package Filipinos abroad send home to family.
- **Padala** — something sent, often entrusted to a person rather than a courier.
- **Pasabay** — having your item carried by someone already traveling your way. *(The word we're named for.)*

---

## Notes for build phase
- All of the above is copy only; Section 2 (Story) is the single net-new layout. Everything else drops into existing components.
- Confirm wording, then I'll implement per the phases in `SPEC-whitepaper-copy-update.md`.
