# Out of Scope

Worth knowing about, but don't build without a direct customer request. These are either wrong for our ICP or require significant complexity that isn't justified at this stage.

---

**Payment processing (venue→client):** Deposit collection, invoicing, payment reminders. Money movement adds legal risk and reconciliation overhead. Use a Stripe Payment Link as a manual workaround for now. Revisit when customers ask consistently.

**HubSpot / Salesforce integrations:** Independent banquet hall operators and boutique hotel GMs don't use enterprise CRMs. If the target market shifts to hotel chains, revisit.

**Zapier / webhook integrations:** Genuinely useful but requires maintaining a webhook delivery system. Use iCal export as the first integration story. Add webhooks when managers have a specific tool they need to connect.

**Cross-venue performance benchmarking:** Only useful when customers have 2+ venues and are actively growing. Build basic analytics (M6) first; revisit if customers ask.

**Equipment / asset inventory:** Relevant for large conference centers. Banquet halls and boutique hotel event rooms don't need this. Use notes in the space description.

**Full audit log with retention policies:** Enterprise compliance feature. The simple activity feed (N9) is sufficient for a small team.

**POS / ticketing integrations:** Niche and operationally complex. Not needed for venue managers in our ICP.

**Mobile app (React Native / PWA):** The web app is mobile-responsive. A native app adds significant maintenance overhead. Revisit only if managers report the mobile web experience is insufficient.

**AI-powered vendor matching upgrade:** The current score-based algorithm works. Upgrade only if managers are consistently unhappy with vendor suggestions.

**Marketplace public reviews:** Requires moderation, response flows, and trust/safety work. Skip until the marketplace itself has meaningful traffic.

**White-label / agency tier:** Different product and pricing model entirely. Out of scope.

**Timeline / run-of-show builder:** Useful but a separate surface. Banquet hall managers use paper timelines or personal notes apps for this today. Not our problem to solve right now.

**F&B / catering management:** Menus, dietary tracking, catering cost integration. Out of scope for a venue booking tool.

**Two-way Google Calendar OAuth sync:** The iCal feed (M14) achieves the same result for our ICP with a fraction of the complexity.

**Interactive product tours / in-app tooltips:** Overkill for this ICP. The onboarding checklist (M10) and empty states are enough. Revisit only if users consistently report confusion after the checklist is in place.
