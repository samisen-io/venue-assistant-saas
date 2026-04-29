# Auto-Booking Agentic Flow for Venue Requests

Based on the codebase analysis (including the `graphify` report and current API routes), this document outlines the feasibility, necessity, and implementation plan for an agentic flow to handle venue bookings.

## Do We Even Need an Agent for This?

**It depends on the input method:**

1. **For the Inquiry Form (`/api/venues/public/[slug]/inquiries`)**: **No.** 
   When a user submits a structured web form with explicit fields (Date, Guest Count, Event Type), a deterministic script is vastly superior. An agent would be over-engineering, slower, more expensive, and prone to hallucinations. A simple backend function can check availability and create the booking.
2. **For the Public AI Chat (`/api/venues/public/[slug]/chat`) & Email Parsing**: **Yes.**
   If a user asks in chat, *"Do you have the Main Hall available for a wedding next Saturday evening?"*, an agent is required to parse the unstructured text, extract the intent (Wedding), the inferred date (Next Saturday), check availability dynamically, and negotiate or finalize the booking conversationally. 

## Current State Analysis (from Graphify)
According to the `graphify` report, the system already has a strong **"AI Chat to Lead Capture Pipeline"**. 
Currently:
1. The Chat API intercepts the user's message.
2. It deterministically checks availability for any dates mentioned and injects the results into Claude's prompt.
3. Claude responds conversationally.
4. In the background, `extractEventDataFromChat()` runs. If enough data is gathered, it creates a **Lead** (via `createLeadFromConversation()`).

**The Gap:** It stops at Lead generation. It does not auto-book the `Event`.

---

## Scope for Agentic Auto-Booking Flow

There is massive scope to elevate the current Chat pipeline from a "Lead Capture" tool to a "Provisional Booking" agent. 

**The goal:** If the user agrees to book and the dates are confirmed available, the agent skips the `Lead` phase entirely and creates a provisional `Event` on the calendar, then notifies the manager. If unavailable, it suggests alternatives or escalates.

## Open Questions

> [!WARNING]
> **Business Logic Clarifications Needed:**
> 1. Should the AI be allowed to book a *Confirmed* event, or should it only create a *Tentative/Provisional* event that requires the venue manager's final click to confirm?
> 2. Do we require payment/deposit capture *before* the AI is allowed to secure the booking on the calendar?
> 3. If the date is unavailable, should the AI suggest alternative dates automatically, or immediately hand off to the manager?

---

## Proposed Changes

We will upgrade the existing Chat-to-Lead pipeline to support Tool Calling (Function Calling) so the agent can autonomously trigger a booking when the conversation reaches a natural conclusion.

### 1. Database & Schema
We need to track events booked by the AI.

#### [MODIFY] `supabase/migrations/...`
- Add an `auto_booked_by_ai` boolean column to the `events` table.
- Ensure the `events` table has a `status` of `'tentative'` (if not already present).

### 2. AI Core Logic (lib/ai/)

#### [MODIFY] `lib/ai/claude.ts`
- Upgrade the `askClaude` utility to support **Tool Use (Function Calling)** using the Anthropic API. 
- Define a tool schema: `book_provisional_event(date, spaces, guest_count, name, email)`.

#### [MODIFY] `lib/ai/prompts/venueChat.ts`
- Update the system prompt to instruct the agent: *"If the user wants to proceed and the date is available, use the `book_provisional_event` tool to secure the spot. If unavailable, apologize and suggest calling the manager."*

### 3. API Route Update

#### [MODIFY] `app/api/venues/public/[slug]/chat/route.ts`
- Refactor the execution loop to handle Claude's tool calls. 
- If Claude calls `book_provisional_event`:
  1. Re-verify availability deterministically (never trust the LLM blindly).
  2. If available, create the `Event` record.
  3. Respond to the user with a confirmation message.
  4. Bypass the standard `shouldCreateLead` logic since an Event is already created.

### 4. Notifications

#### [MODIFY] `lib/leads/leadNotifier.ts`
- Add a new function: `notifyManagerOfAIBooking()`.
- Send an urgent email to the venue manager: *"The AI Assistant just provisionally booked an event for [Date]. Please review and send the deposit link."*

## Verification Plan

### Automated Tests
- Run `npm run test` focusing on integration tests for the chat route.
- Mock the Claude API response to return a `book_provisional_event` tool call and verify that an `Event` record is inserted into the database instead of a `Lead`.

### Manual Verification
- Launch the dev server (`npm run dev`).
- Open a test venue's public chat widget.
- Have a conversation: ask for an available date, provide contact details, and ask to book it.
- Verify in the Supabase database that an `Event` was created (with `status: tentative`) and that the manager email was logged.
