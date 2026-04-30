# Autonomous Venue Manager Agent: Capabilities & Scope

If we were to expand the current "AI Chatbot" into a full-fledged **Venue Manager Agent**, it could autonomously handle the majority of the operational workload. Based on the data structures and features already present in the `venue-assistant-saas` repository, here is a categorized list of capabilities this agent could possess:

## 1. Top-of-Funnel Sales & Lead Intake
*   **Conversational Qualification:** Chat with prospects on the public page, extract key event requirements (date, type, budget, guest count), and deterministically verify calendar availability.
*   **Lead Scoring & Triaging:** Analyze the gathered data to calculate a `priority_score` (e.g., high-budget corporate events get a higher score) and automatically flag VIP leads for human intervention.
*   **Auto-Lead Creation:** Bypass manual data entry by populating the CRM (`leads` table) with structured data extracted from unstructured chat or email inquiries.

## 2. Proposal Generation & Follow-Up
*   **Drafting Proposals:** Autonomously generate a draft Proposal/Quote by matching the prospect's needs to the venue's predefined packages and add-ons. 
*   **Follow-up Cadence:** Track the status of sent proposals. If a lead hasn't opened or signed the proposal within 3 days, the agent sends a polite, context-aware follow-up email.
*   **Micro-Negotiations:** If authorized by the venue manager's settings, the agent could offer small, pre-approved concessions (e.g., "I can waive the AV fee if you book by Friday") to close the deal autonomously.

## 3. Booking & Calendar Operations
*   **Auto-Conversion:** Once a proposal is digitally signed and a deposit is captured (via Stripe), the agent autonomously converts the `Lead` into a confirmed `Event`.
*   **Logistical Scheduling:** Automatically block off calendar dates not just for the event, but for required setup and teardown buffer times based on the event type (e.g., weddings need 1 day of setup).
*   **Conflict Resolution:** If a double-booking risk arises, the agent can proactively text or email the prospect to suggest alternative dates.

## 4. Vendor Procurement & Coordination
*(This leverages the existing vendor communication schemas in the app)*
*   **Requirement Analysis:** Read the event brief and determine what services are needed (Catering, DJ, Decorators).
*   **Outreach & RFQs (Request for Quote):** Autonomously email preferred vendors from the venue's `vendors` database asking for pricing and availability for the specific date.
*   **Quote Parsing:** Read reply emails from vendors, extract the quoted price and terms, and populate the `vendor_quotes` table.
*   **Vendor Selection:** Rank the incoming vendor quotes based on budget constraints and the vendor's historical `reliability_score`, presenting a "ready-to-approve" list to the human venue manager.

## 5. Post-Booking Client Concierge
*   **Answering Logistics:** Serve as a 24/7 inbox assistant answering standard client questions via email ("What are the dimensions of the stage?", "Where do caterers load in?").
*   **Payment Reminders:** Track due dates for 50% deposits or final balances and send automated reminder emails with payment links.
*   **Final Headcount Collection:** Email the client 14 days out to finalize the guest count and dietary restrictions.

## 6. Post-Event Operations
*   **Review Collection:** Send an automated email to the client the day after the event asking for a testimonial (to feed back into the venue's public page).
*   **Vendor Feedback:** Ping the human venue manager to quickly rate the vendors used, updating the vendor's long-term internal rating.
*   **Financial Reconciliation:** Finalize the event budget vs. actuals based on the accepted vendor quotes. 

---
**Summary:** By treating the Venue Manager Agent as a "digital employee" with access to email and the database, the human venue manager would transition from *doing* the work to simply *approving* the agent's work (e.g., clicking "Approve" on a proposal the AI drafted before it sends).
