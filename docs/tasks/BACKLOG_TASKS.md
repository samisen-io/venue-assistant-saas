# Backlog Tasks

## Who We're Building For

We are building for two specific venue types. Every decision in this backlog is filtered through their reality.

**Primary: Independent Banquet Halls & Event Spaces**
Single manager or small team running 1–3 spaces. No sophisticated software today — likely a Google Sheet, a personal email, and a phone. They live and die by leads and vendor coordination. Pain is high, willingness to pay is real ($99–$199/mo is trivial relative to a single booking). There are tens of thousands of these in the US.

**Secondary: Boutique Hotels (1–2 event rooms)**
Small hotels where the GM handles event bookings — no dedicated event coordinator. They charge premium pricing, so the software cost is noise. They may have existing tools (Opera, etc.) but those tools don't handle vendor coordination, proposals, or a standalone event page. Slightly longer sales cycle, but higher ACV.

**What this means for the backlog:** Favor the operator who checks their phone 10x a day and has no IT department. Simplicity and speed-to-value beat completeness. If a feature adds friction for a solo manager, reconsider it. When in doubt, do less and do it well.

---

## Priority Levels

| File | Contents |
|---|---|
| [MUST_HAVE.md](MUST_HAVE.md) | M1–M14 — broken, missing, or blocking value. Ship these first. Includes 4-week build order. |
| [NICE_TO_HAVE.md](NICE_TO_HAVE.md) | N1–N9 — genuinely useful, build once Must Haves are stable and customers are paying. |
| [OUT_OF_SCOPE.md](OUT_OF_SCOPE.md) | Don't build without a direct customer request. Wrong for ICP or unjustified complexity. |

---

## Source References

| Area | Notes |
|------|-------|
| Stripe & Billing | `docs/tasks/STRIPE_SUBSCRIPTION_TASKS.md` |
| Public Marketplace | `docs/tasks/PublicMarketplace_TaskList.md`, `docs/prds/MARKETPLACE_PRD.md` |
| Public Venue Pages | `docs/tasks/PUBLIC_PAGES_TASKS.md` |
| AI Chat & Proposals | `docs/prds/MARKETPLACE_PRD.md` §3.2–3.4 |
| Last reorganized | 2026-02-25 — split into three priority files |
