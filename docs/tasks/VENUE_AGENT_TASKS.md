# Venue Manager Agent - Implementation Tasks

This document tracks the progress of building the autonomous Venue Manager Agent capabilities into the `venue-assistant-saas` platform.

## Phase 1: Foundation & Tool Calling (Sales Agent)
- [ ] **Agent Orchestration Setup:** Integrate Vercel AI SDK with Claude 3.5 Sonnet to enable robust Tool Calling (Function Calling).
- [ ] **Tool Registration:** Create the `book_provisional_event` tool schema so the agent can interact with the calendar.
- [ ] **Chat Router Update:** Refactor `app/api/venues/public/[slug]/chat/route.ts` to support multi-turn tool execution.
- [ ] **Lead to Event Auto-Conversion:** Update background processes so the AI can automatically create a tentative `Event` record upon agreement.
- [ ] **Agent Analytics:** Add an `auto_booked_by_ai` flag to track ROI and conversion rates for the agent.

## Phase 2: Autonomous Proposal Generation
- [ ] **Proposal Schema Expansion:** Ensure the agent has full read access to all Venue Packages and Add-ons.
- [ ] **Tool Registration:** Create the `draft_proposal` tool for the agent.
- [ ] **Workflow Trigger:** When a lead is deemed "ready," trigger an Inngest background job to have the agent draft a proposal.
- [ ] **Manager Approval Flow:** Add a UI toggle on the `LeadDetail` page so the manager can review and click "Approve & Send" on AI-drafted proposals.
- [ ] **Automated Follow-ups:** Create an Inngest cron job that prompts the agent to draft follow-up emails for stale proposals.

## Phase 3: Vendor Procurement Agent
- [ ] **Email Inbound Parsing:** Enhance the `/api/webhooks/email/inbound` route to route vendor replies directly to the agent's context.
- [ ] **Tool Registration:** Create the `email_vendors_rfq` tool for the agent to blast preferred vendors for quotes.
- [ ] **Quote Extraction:** Upgrade `extractQuoteFromReply` to parse unstructured vendor emails into structured `vendor_quotes` rows.
- [ ] **Vendor Ranking Logic:** Implement the weighting algorithm to sort incoming quotes by price and vendor `reliability_score`.

## Phase 4: Post-Booking Concierge
- [ ] **Client Q&A Tooling:** Give the agent RAG (Retrieval-Augmented Generation) access to the Venue's knowledge base (dimensions, parking rules, load-in times).
- [ ] **Automated Reminders:** Use Inngest to schedule 14-day and 30-day triggers for the agent to email the client regarding final headcounts and deposits.
- [ ] **Financial Reconciliation:** Build the logic for the agent to finalize the event budget once all vendor quotes are accepted and the event concludes.
