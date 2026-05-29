# Spec: Landing Site Copy Update from White Paper

**Source:** `pasabayan-api/public/docs/white-paper.html` (Partner Edition, v1.1)
**Target:** `pasabayan-frontend` (`index.html` + `src/styles/main.scss`)
**Status:** Plan only — no build yet
**Decisions on record:**
- This is a **marketing site**. Skip ALL technical/partner material: stack (Laravel/PostgreSQL), controller/model/migration counts, Stripe Connect mechanics, API integration patterns, roadmap, performance benchmarks, security/ops internals.
- Take only the **narrative, heritage, and trust statements** — the wordings consumers care about.
- **The white paper is the latest source of truth and aligns with the actual backend.** Where the live site contradicts it, the site is out of date and must be corrected to match — these are not optional marketing choices.

---

## 1. What we take from the white paper (and where it lands)

| White-paper material | Site destination | Type |
|---|---|---|
| "Rooted in Filipino tradition. Built for everyone." | New Story section + About | Copy |
| Balikbayan box / padala / pasabay meaning | About (enrich mission) | Copy |
| Heritage is "the soul, not the boundary"; "you don't need to be Filipino to send, carry, or belong" | Story section | Copy |
| **The problem**: informal FB-group pasabay = unverified identities, pay-on-trust, scattered requests, no delivery confirmation, no recourse | New Story section (the "why") | Copy + new layout |
| Tiered verification: Basic (email) → Verified (phone) → Premium (gov-ID) | Trust & Safety grid | Copy |
| Confirmed handoffs via one-time pickup/delivery codes | Trust & Safety grid | Copy |
| Escrow releases only on confirmed delivery | Trust & Safety grid (already present) | Copy |
| On-platform chat + off-platform-payment fraud detection | Trust & Safety grid | Copy |
| Two-sided ratings / durable reputation | Trust & Safety grid | Copy |
| Structured disputes & refunds for eligible outcomes | Trust & Safety grid | Copy |
| Declared value is informational, **not insurance**; liability bounded by Terms | Small disclosure line near grid | Copy |

**Explicitly excluded** (per decision): everything in white-paper sections Technical Foundation, Matching/Decision Logic internals, Payments mechanics, Economics, Security & Risk, Privacy/Data Governance, Performance Snapshot, Integration/Partnership, Roadmap.

---

## 2. Required corrections (live copy contradicts the backend)

The white paper reflects actual backend behavior, so these live-site claims are **inaccurate and must be fixed**. Only the exact replacement wording (not whether to fix) is open.

1. **Features → "Verified Users": "ID verification and background checks"**
   Backend/paper: there are **no background checks**; it's tiered verification (email → phone OTP → optional gov-ID).
   → Fix: reframe as tiered verification, drop "background checks".

2. **Sender step 3 → "Money-Back Guarantee" tag**
   Backend/paper: **no insurance product / no protection pool**; only escrow refunds for *eligible* cancellations.
   → Fix: replace with "Escrow Protected" / "Refund on Eligible Cancellations".

3. **Carrier step 4 → "Instant Payout" / "instant payment"**
   Backend/paper: delivery-*triggered* release via Stripe Connect (not guaranteed instant).
   → Fix: soften to "Fast Payout" / "Paid on Confirmed Delivery".

4. **Footer "© 2025"** → 2026.

---

## 3. New sections & design impact

### 3.1 New: "Why Pasabayan" / Story section
- **Placement:** after the Roles section (`#how-it-works`), before the Sender journey.
- **Content:** heritage line → what pasabay/padala means → the problem with informal arrangements → how Pasabayan structures it safely.
- **Layout:** section header + a two-column comparison:
  - *The old way* (informal, risky): unverified people, pay before pickup, scattered comment threads, no proof of delivery, no recourse.
  - *The Pasabayan way*: verified identities, escrow held until delivery, structured requests & matching, in-app chat, confirmation codes, refunds & disputes.
- **Design cost:** ONE net-new SCSS block (`.story`). Reuses existing color tokens, spacing, fonts, and breakpoints from `_variables.scss`/`_mixins.scss`. New nav link "Why Pasabayan" → `#why`.

### 3.2 Re-content (no new design): Trust & Safety grid
- Reuses existing `.features` / `.feature-card` grid as-is (6 cards).
- New card mapping: Tiered Verification · Escrow (release on delivery) · Confirmed Handoff Codes · On-Platform Chat & Fraud Detection · Two-Sided Reviews · Disputes & Refunds.
- Add one small disclosure line under the grid: declared value is informational, not insurance.
- Consider renaming heading from "Built for Trust & Safety" → keep, it already fits.

### 3.3 Copy-only: About / heritage enrichment
- Expand `.about__mission` with balikbayan/padala/pasabay framing + "built for everyone / you don't need to be Filipino to belong here."
- No layout change.

**Net design work = 1 new section style block. Everything else is copy/content edits into existing components.**

---

## 4. Development phases

- **Phase 0 — Accuracy fixes** (Section 2): copy-only edits in `index.html`. Pending your sign-off on wording.
- **Phase 1 — Story section** (3.1): add markup in `index.html` after Roles; add `.story` block to `main.scss`; add nav link.
- **Phase 2 — Trust & Safety re-content** (3.2): swap card copy in existing grid; add disclosure line.
- **Phase 3 — About enrichment** (3.3): expand mission copy.
- **Phase 4 — Build & verify**: `npm run build`; check desktop + mobile breakpoints; confirm anchor nav.

---

## 5. Open items needing your decision before Phase 0

The corrections in Section 2 are confirmed required (white paper = source of truth), so they are no longer in question — only their exact wording is.

1. **Replacement wording** — confirm the proposed phrasings in Section 2 (e.g. "Escrow Protected" / "Paid on Confirmed Delivery"), or tweak to taste.
2. **Heritage prominence** — do you want the Filipino-tradition story as a prominent standalone section (recommended), or kept lighter/inside About only?
3. **Draft copy** — next deliverable is the exact final wording for each section before any HTML/SCSS is written.
