# Nice to Have

Genuinely useful for banquet halls and boutique hotels. Build these once Must Haves are stable and paying customers are using the product.

---

### N1. Testimonials — Pull Forward from Original Nice-to-Have

Testimonials show on the public venue page and directly impact lead conversion. For an independent banquet hall competing with larger venues, real testimonials are their strongest trust signal. For a boutique hotel, they reinforce the premium positioning.

- [ ] **Testimonial request email:** triggered manually by the venue manager from the event detail page ("Request testimonial" button). Sends a simple email with a direct link to submit a testimonial for the venue's public page.
- [ ] Wire submitted testimonials to the testimonials carousel on the public page

This is a small addition to the email system (M2 must be live first) with outsized impact on public page conversion. Deliberately pulled up from the original backlog position.

---

### N2. Staff Access (Simplified)

Many banquet halls have 1–2 additional staff: a coordinator, an assistant, or a part-time salesperson. Boutique hotels may have the GM and an events assistant. We don't need enterprise role hierarchies — just two roles: **Owner** and **Staff**.

**What Staff can do:** view and create/edit events, vendors, spaces, clients, leads.
**What only the Owner can do:** delete anything, manage billing, publish the public page, invite/remove staff.

- [ ] Migration: `venue_members` table with fields: `id`, `venue_id`, `user_id` (null until accepted), `email`, `role` (owner | staff), `status` (pending | active | revoked), `invite_token`, `invited_at`, `accepted_at`
- [ ] Update RLS policies to accept active members alongside the owner
- [ ] `POST /api/venues/:id/members` — owner invites by email; sends invite email via Resend
- [ ] `/accept-invite?token=` page — activates membership on click; handles both new and existing users
- [ ] `/dashboard/settings/team` page — list active staff and pending invites; "Invite" button, "Remove" action
- [ ] Allow up to 1 staff member on Starter, 3 on Growth, unlimited on Professional+

Skip: admin role, ownership transfer, "leave venue" self-service.

---

### N3. Google Calendar / iCal Sync

> **Promoted to M14 (Must Have).** See [MUST_HAVE.md](MUST_HAVE.md#m14-ical-feed--calendar-sync) for the full spec. Remove this item once M14 is shipped.

---

### N4. Discount Codes (Simple)

Banquet halls regularly offer discounts for off-peak bookings (weekday weddings, January corporate events), repeat clients, or referrals. Boutique hotels use them for corporate accounts.

- [ ] Migration: `discount_codes` table — `id`, `venue_id`, `code`, `type` (percent | fixed), `value`, `max_uses` (nullable), `uses_count`, `valid_until` (nullable), `is_active`
- [ ] CRUD UI at `/dashboard/discount-codes` — create, list, deactivate codes
- [ ] Validate and apply a code when creating a proposal: deduct from total, show the discount line in the PDF
- [ ] Increment `uses_count` when a code is used; auto-deactivate when `max_uses` is reached

Skip: time-limited promotional pricing on packages, cross-venue bundle deals.

---

### N5. Email — Follow-Up Templates

Once core email (M2) is working, add these:

- [ ] **Lead follow-up nudge:** if a lead has been in `contacted` status for 3+ days with no activity, show a reminder badge on the leads list (in-app, not email for now)
- [ ] **Testimonial request email:** triggered manually by the venue manager from the event detail page. Sends a simple email with a direct link to submit a testimonial for the venue's public page. (Requires M2 live first. See also N1.)

Skip: automated email sequences, multi-step nurture flows. A solo manager should decide when to follow up personally.

---

### N6. Public Marketplace — Simple Discovery Page

Individual venue pages work. The marketplace homepage helps prospects find venues when they don't have a direct link. Especially useful for banquet halls that don't have strong SEO yet.

- [ ] Create public home route (`app/page.tsx`) separate from the authenticated dashboard
- [ ] Featured venues grid showing published venues (simple query, no algorithm)
- [ ] `GET /api/public/featured-venues` endpoint — return published venues ordered by `created_at desc`, limit 9
- [ ] Basic search: filter by event type and city/state (simple text match)
- [ ] "For Venue Managers" CTA section linking to `/signup`
- [ ] Footer with links to privacy policy and terms

Skip: Redis caching, URL-synced filter state, category navigation.

---

### N7. SEO Basics

Small but meaningful for organic discovery. Banquet halls and boutique hotels both benefit from local search traffic.

- [ ] Per-venue `<head>` meta tags on the public page: `<title>`, `<meta name="description">`, `og:image`, `og:title`
- [ ] Dynamic sitemap at `/sitemap.xml` including all published venue slugs
- [ ] `robots.txt`

Skip: Schema.org JSON-LD markup. Add it later if SEO becomes a priority.

---

### N8. Availability Calendar — Mobile & Accessibility

Venue managers check availability on their phones constantly — mid-event, between walkthroughs.

- [ ] Mobile swipe left/right to change months on the public availability calendar
- [ ] Color-blind accessible color scheme for booked/available dates (don't rely on red/green alone — add a pattern or icon)
- [ ] Auto-populate the calendar from the `events` table so confirmed events show as booked without manual entry

---

### N9. Simple Activity Feed

For banquet halls and boutique hotels with a small team, a lightweight log of "who did what" is enough. Not an audit log — just a "recent activity" list.

- [ ] Migration: `activity_log` table — `id`, `venue_id`, `actor_email`, `action` (plain text e.g. "Created event Summer Gala"), `created_at`
- [ ] Log entries on: event create/update/delete, lead status change, vendor assignment, proposal sent
- [ ] Show the last 30 entries on `/dashboard/settings/activity` in a simple list: timestamp, who, what
- [ ] Auto-purge entries older than 90 days

Skip: before/after diffs, per-field change tracking, CSV export. A small team doesn't need compliance tooling.
