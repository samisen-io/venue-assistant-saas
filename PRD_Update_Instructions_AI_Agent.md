# VenueManager PRD Update Instructions
## Adding AI Agent Features for Vendor Communication

---

## OVERVIEW

This document provides instructions to update the existing VenueManager PRD to include three new AI-powered features:

1. **Natural Language Event Creation** - Users can type event requirements in plain text
2. **AI Vendor Communication Agent** - Automated email outreach and negotiation with vendors
3. **Communication Dashboard** - View email threads and approve vendor quotes

**Implementation Approach**: Custom Claude API integration with webhook-driven agent (Option D from architecture analysis)

---

## INSTRUCTIONS FOR CLAUDE CODE

### **Task 1: Update Database Schema Section**

Add the following new tables to the existing database schema:

#### **1. Add `vendor_communications` table**

```sql
-- Communications table (email threads between system and vendors)
CREATE TABLE vendor_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  
  -- Email metadata
  thread_id TEXT, -- For grouping emails in a conversation (e.g., Resend thread ID)
  direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')), -- outbound = we sent, inbound = vendor replied
  subject TEXT,
  body TEXT NOT NULL,
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  
  -- Tracking
  sent_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'bounced', 'replied', 'failed')),
  
  -- Metadata for agent processing
  processed BOOLEAN DEFAULT false, -- Has the agent processed this communication?
  requires_followup BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_communications_event ON vendor_communications(event_id);
CREATE INDEX idx_communications_vendor ON vendor_communications(vendor_id);
CREATE INDEX idx_communications_thread ON vendor_communications(thread_id);
CREATE INDEX idx_communications_direction ON vendor_communications(direction);
CREATE INDEX idx_communications_processed ON vendor_communications(processed) WHERE NOT processed;
```

#### **2. Add `vendor_quotes` table**

```sql
-- Vendor quotes extracted by AI agent from email responses
CREATE TABLE vendor_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  communication_id UUID REFERENCES vendor_communications(id) ON DELETE SET NULL,
  
  -- Quote details (extracted by Claude from vendor email)
  total_cost DECIMAL(10,2) NOT NULL,
  breakdown JSONB, -- { "catering_per_person": 25, "setup_fee": 500, "service_charge": 200 }
  
  -- Availability
  availability_confirmed BOOLEAN DEFAULT false,
  available_date DATE,
  setup_time TIME,
  
  -- Terms extracted from email
  deposit_required DECIMAL(10,2),
  deposit_percentage DECIMAL(5,2),
  payment_terms TEXT,
  cancellation_policy TEXT,
  additional_notes TEXT,
  
  -- Approval workflow
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'withdrawn')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  
  -- Raw data for audit trail
  raw_email_text TEXT, -- Original email body for reference
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quotes_event ON vendor_quotes(event_id);
CREATE INDEX idx_quotes_vendor ON vendor_quotes(vendor_id);
CREATE INDEX idx_quotes_status ON vendor_quotes(status);
CREATE INDEX idx_quotes_pending ON vendor_quotes(event_id, status) WHERE status = 'pending';
```

#### **3. Add `agent_runs` table**

```sql
-- Agent execution tracking for monitoring and debugging
CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  
  -- Run metadata
  trigger_type TEXT, -- 'manual', 'webhook', 'scheduled'
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'paused')),
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Progress tracking
  vendors_targeted INTEGER DEFAULT 0, -- How many vendors should be contacted
  vendors_contacted INTEGER DEFAULT 0, -- How many initial emails sent
  vendors_responded INTEGER DEFAULT 0, -- How many vendors replied
  quotes_received INTEGER DEFAULT 0, -- How many complete quotes extracted
  
  -- Error tracking
  error_count INTEGER DEFAULT 0,
  last_error_message TEXT,
  last_error_at TIMESTAMP WITH TIME ZONE,
  
  -- Agent logs (for debugging and transparency)
  logs JSONB DEFAULT '[]', -- Array of log entries: [{ timestamp, action, details }]
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agent_runs_event ON agent_runs(event_id);
CREATE INDEX idx_agent_runs_status ON agent_runs(status);
```

#### **4. Add RLS policies for new tables**

```sql
-- Row Level Security for vendor_communications
ALTER TABLE vendor_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view communications for own venue events" ON vendor_communications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      JOIN venues ON events.venue_id = venues.id
      WHERE events.id = vendor_communications.event_id 
      AND venues.owner_id = auth.uid()
    )
  );

CREATE POLICY "System can insert communications" ON vendor_communications
  FOR INSERT WITH CHECK (true); -- System needs to insert on behalf of agent

CREATE POLICY "System can update communications" ON vendor_communications
  FOR UPDATE USING (true);

-- Row Level Security for vendor_quotes
ALTER TABLE vendor_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quotes for own venue events" ON vendor_quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      JOIN venues ON events.venue_id = venues.id
      WHERE events.id = vendor_quotes.event_id 
      AND venues.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update quotes for own events" ON vendor_quotes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM events 
      JOIN venues ON events.venue_id = venues.id
      WHERE events.id = vendor_quotes.event_id 
      AND venues.owner_id = auth.uid()
    )
  );

-- Row Level Security for agent_runs
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view agent runs for own venue events" ON agent_runs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      JOIN venues ON events.venue_id = venues.id
      WHERE events.id = agent_runs.event_id 
      AND venues.owner_id = auth.uid()
    )
  );
```

---

### **Task 2: Update Application Structure**

Add the following new directories and files to the app structure:

```
app/
├── (dashboard)/
│   ├── events/
│   │   └── [eventId]/
│   │       ├── communications/
│   │       │   └── page.tsx              # NEW: Communication dashboard for event
│   │       └── extract/
│   │           └── page.tsx              # NEW: Natural language event creation
│   └── communications/
│       └── [vendorId]/
│           └── page.tsx                  # NEW: Detailed thread view with vendor
│
├── api/
│   ├── ai/
│   │   ├── extract-event/
│   │   │   └── route.ts                  # NEW: POST - Extract event from natural language
│   │   └── analyze-email/
│   │       └── route.ts                  # NEW: POST - Analyze vendor email with Claude
│   ├── agent/
│   │   ├── start/
│   │   │   └── route.ts                  # NEW: POST - Start agent for event
│   │   ├── process-reply/
│   │   │   └── route.ts                  # NEW: POST - Process vendor reply
│   │   └── status/
│   │       └── route.ts                  # NEW: GET - Get agent run status
│   ├── communications/
│   │   ├── route.ts                      # NEW: GET - List communications for event
│   │   ├── [communicationId]/
│   │   │   └── route.ts                  # NEW: GET - Get communication details
│   │   └── thread/
│   │       └── route.ts                  # NEW: GET - Get full thread for vendor+event
│   ├── quotes/
│   │   ├── route.ts                      # NEW: GET - List quotes for event
│   │   └── [quoteId]/
│   │       ├── approve/
│   │       │   └── route.ts              # NEW: POST - Approve quote
│   │       └── reject/
│   │           └── route.ts              # NEW: POST - Reject quote
│   ├── webhooks/
│   │   ├── resend/
│   │   │   └── route.ts                  # NEW: POST - Resend webhook for incoming emails
│   │   └── email-status/
│   │       └── route.ts                  # NEW: POST - Email delivery status updates
│   └── email/
│       ├── send/
│       │   └── route.ts                  # NEW: POST - Send email via Resend
│       └── draft/
│           └── route.ts                  # NEW: POST - Draft email with Claude

components/
├── communications/
│   ├── CommunicationDashboard.tsx        # NEW: Main communication dashboard
│   ├── ThreadView.tsx                    # NEW: Email thread display
│   ├── EmailMessage.tsx                  # NEW: Individual email message card
│   └── VendorResponseStatus.tsx          # NEW: Status indicator per vendor
├── quotes/
│   ├── QuoteCard.tsx                     # NEW: Quote display with approve/reject
│   ├── QuoteComparison.tsx               # NEW: Side-by-side quote comparison
│   └── QuoteApprovalModal.tsx            # NEW: Confirmation modal for approval
├── agent/
│   ├── AgentActivityLog.tsx              # NEW: Real-time agent activity display
│   ├── AgentStatusBadge.tsx              # NEW: Status indicator (running/completed/failed)
│   └── AgentProgressBar.tsx              # NEW: Progress visualization
└── events/
    └── NaturalLanguageEventForm.tsx      # NEW: Textarea + extract button

lib/
├── ai/
│   ├── claude.ts                         # NEW: Claude API client wrapper
│   ├── prompts/
│   │   ├── eventExtraction.ts            # NEW: Prompt for extracting event details
│   │   ├── emailDrafting.ts              # NEW: Prompts for drafting vendor emails
│   │   ├── emailAnalysis.ts              # NEW: Prompts for analyzing vendor replies
│   │   └── quoteExtraction.ts            # NEW: Prompts for extracting quote details
│   └── tools/
│       └── emailTools.ts                 # NEW: Tool definitions for Claude agent
├── email/
│   ├── resend.ts                         # NEW: Resend client wrapper
│   ├── templates/
│   │   ├── vendorOutreach.ts             # NEW: Initial vendor outreach email template
│   │   ├── followUp.ts                   # NEW: Follow-up email template
│   │   └── confirmation.ts               # NEW: Quote approval confirmation template
│   └── parser.ts                         # NEW: Email parsing utilities
├── agent/
│   ├── orchestrator.ts                   # NEW: Main agent orchestration logic
│   ├── vendorCommunicator.ts             # NEW: Handles vendor email interactions
│   ├── quoteExtractor.ts                 # NEW: Extracts quotes from emails
│   └── stateMachine.ts                   # NEW: Agent state management
└── types/
    ├── agent.types.ts                    # NEW: TypeScript types for agent
    ├── communication.types.ts            # NEW: TypeScript types for communications
    └── quote.types.ts                    # NEW: TypeScript types for quotes

hooks/
├── useCommunications.ts                  # NEW: Hook for fetching communications
├── useQuotes.ts                          # NEW: Hook for fetching quotes
├── useAgent.ts                           # NEW: Hook for agent status
└── useEventExtraction.ts                 # NEW: Hook for NL event extraction
```

---

### **Task 3: Add New Feature Specifications**

Add these new feature sections to the PRD document after the existing features:

---

## **FEATURE 8: Natural Language Event Creation**

### **Overview**
Allow users to create events by typing requirements in natural language instead of filling out a structured form.

### **User Flow**

1. User navigates to "Create Event" page
2. User sees two options:
   - **Quick Create** (natural language textarea) - Default/Recommended
   - **Manual Form** (traditional form) - Fallback option
3. User types event description in textarea, for example:
   ```
   "I need to organize a corporate gala for 300 people on December 15th, 2024. 
   Our budget is $25,000. We'll need catering, AV equipment, and floral 
   arrangements. This is a formal dinner event starting at 6 PM."
   ```
4. User clicks "Extract Event Details" button
5. System shows loading state: "Analyzing your requirements..."
6. System displays extracted data in a preview card:
   ```
   📋 Extracted Event Details:
   
   Event Name: Corporate Gala
   Type: Gala
   Date: December 15, 2024
   Time: 6:00 PM
   Guest Count: 300
   Budget: $25,000
   
   Required Vendors:
   ✓ Catering
   ✓ AV Equipment
   ✓ Florals
   
   Special Requirements:
   - Formal dinner event
   
   [Edit Details] [Create Event]
   ```
7. User can click "Edit Details" to modify extracted data
8. User clicks "Create Event" to save

### **UI Components**

**Page: `app/(dashboard)/events/new/page.tsx`**

Layout:
```
┌─────────────────────────────────────────────┐
│ Create New Event                            │
├─────────────────────────────────────────────┤
│                                             │
│ [Tab: Quick Create] [Tab: Manual Form]     │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Describe your event requirements:       │ │
│ │                                         │ │
│ │ [Large textarea - 6 rows minimum]       │ │
│ │                                         │ │
│ │ Example: "I need a wedding for 150     │ │
│ │ guests on June 10th with $15k budget..." │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Extract Event Details] ← Primary button   │
│                                             │
│ ── OR ──                                    │
│                                             │
│ [Fill Form Manually →] ← Secondary link    │
│                                             │
└─────────────────────────────────────────────┘

After extraction:

┌─────────────────────────────────────────────┐
│ Review Extracted Details                    │
├─────────────────────────────────────────────┤
│ ✅ Event details extracted successfully     │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Event Name: Corporate Gala       [Edit] │ │
│ │ Type: Gala                       [Edit] │ │
│ │ Date: Dec 15, 2024               [Edit] │ │
│ │ Time: 6:00 PM                    [Edit] │ │
│ │ Guests: 300                      [Edit] │ │
│ │ Budget: $25,000                  [Edit] │ │
│ │                                         │ │
│ │ Required Services:                      │ │
│ │ ☑ Catering                              │ │
│ │ ☑ AV Equipment                          │ │
│ │ ☑ Florals                               │ │
│ │ ☐ Parking                               │ │
│ │ ☐ Security                              │ │
│ │                                         │ │
│ │ Special Requirements:                   │ │
│ │ Formal dinner event                     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [← Start Over] [Create Event →]            │
└─────────────────────────────────────────────┘
```

### **API Endpoint Specification**

**POST `/api/ai/extract-event`**

Request:
```typescript
{
  venue_id: string;
  description: string; // Natural language text
}
```

Response:
```typescript
{
  success: boolean;
  extracted: {
    event_name: string;
    event_type: "gala" | "wedding" | "conference" | "corporate" | "party" | "other";
    event_date: string; // ISO date
    event_time?: string; // HH:MM format
    guest_count: number;
    budget_total: number;
    required_categories: string[]; // ["catering", "av", "florals"]
    special_requirements?: string;
    description: string; // Original description
  };
  confidence: "high" | "medium" | "low"; // How confident the AI is
  missing_fields?: string[]; // Fields that couldn't be extracted
}
```

### **Claude Prompt Template**

Located in: `lib/ai/prompts/eventExtraction.ts`

Prompt structure:
```
You are an event planning assistant. Extract structured event details from the user's natural language description.

RULES:
1. Extract ONLY information explicitly stated
2. Do not make assumptions or invent details
3. If a field cannot be determined, omit it
4. Parse dates flexibly (handle "next Friday", "Dec 15", "12/15/24", etc.)
5. Identify vendor categories from context (e.g., "food" → "catering", "sound system" → "av")
6. Extract budget even if written as "$25k", "25000", or "twenty-five thousand"

Return a JSON object with these exact fields:
{
  "event_name": "string - create a descriptive name if not provided",
  "event_type": "gala|wedding|conference|corporate|party|other",
  "event_date": "YYYY-MM-DD",
  "event_time": "HH:MM (24-hour format) - optional",
  "guest_count": number,
  "budget_total": number,
  "required_categories": ["catering", "av", etc.],
  "special_requirements": "string - any special notes",
  "confidence": "high|medium|low"
}

USER DESCRIPTION:
{user_input}
```

### **Error Handling**

- If extraction fails: Show error message + fallback to manual form
- If confidence is "low": Show warning + allow user to review carefully
- If required fields missing: Highlight them + ask user to fill in

---

## **FEATURE 9: AI Vendor Communication Agent**

### **Overview**
Automated agent that contacts vendors via email, negotiates quotes, handles back-and-forth communication, and extracts finalized quotes for user approval.

### **Agent Workflow**

#### **Phase 1: Initial Outreach**

1. User views event detail page
2. User clicks "Match Vendors" (existing feature)
3. System shows ranked vendor recommendations per category
4. User reviews recommendations
5. User clicks **NEW BUTTON**: "Engage Vendors with AI Agent"
6. System shows confirmation modal:
   ```
   Start AI Agent?
   
   The AI agent will:
   ✓ Email selected vendors with event requirements
   ✓ Answer their questions automatically
   ✓ Negotiate quotes on your behalf
   ✓ Extract and present final quotes for your approval
   
   You can monitor all communications in real-time.
   
   [Cancel] [Start Agent →]
   ```
7. User clicks "Start Agent"
8. System creates `agent_run` record
9. Agent begins sending emails to vendors

#### **Phase 2: Agent Email Loop**

```
FOR EACH vendor in matched_vendors:
  
  IF vendor has NOT been contacted:
    ↓
    Agent calls Claude API to draft personalized email:
      - Include: event type, date, guest count, requirements
      - Tone: Professional, clear, requesting quote
      - Deadline: "Please respond within 48 hours"
    ↓
    Agent sends email via Resend
    ↓
    Save to vendor_communications (direction: outbound)
    ↓
    Update agent_run: vendors_contacted++
  
  IF vendor has replied (webhook triggered):
    ↓
    Agent calls Claude API to analyze vendor's email:
      - Extract: quote amount, availability, questions
      - Classify: complete_quote | needs_clarification | declined
    ↓
    IF complete_quote:
      ↓
      Extract quote details to vendor_quotes table
      ↓
      Mark communication as processed
      ↓
      Update agent_run: quotes_received++
    
    IF needs_clarification:
      ↓
      Claude drafts follow-up email answering vendor's questions
      ↓
      Send follow-up email
      ↓
      Save to vendor_communications
      ↓
      Wait for vendor's next reply
    
    IF declined:
      ↓
      Mark vendor as unavailable
      ↓
      Suggest backup vendor to user

END FOR EACH

IF all vendors responded OR 72 hours elapsed:
  ↓
  Mark agent_run as completed
  ↓
  Notify user: "Agent completed - 3 quotes received"
```

### **Agent Architecture**

**Components:**

1. **Agent Orchestrator** (`lib/agent/orchestrator.ts`)
   - Main loop coordinator
   - Manages agent_run state
   - Decides which vendors need action

2. **Vendor Communicator** (`lib/agent/vendorCommunicator.ts`)
   - Drafts emails using Claude
   - Sends emails via Resend
   - Tracks email delivery status

3. **Quote Extractor** (`lib/agent/quoteExtractor.ts`)
   - Analyzes vendor replies with Claude
   - Extracts structured quote data
   - Validates quote completeness

4. **State Machine** (`lib/agent/stateMachine.ts`)
   - Tracks communication state per vendor
   - Determines next action (send, wait, follow-up, complete)

### **Email Webhook Flow**

```
Vendor sends reply email
  ↓
Resend receives email
  ↓
Resend fires webhook: POST /api/webhooks/resend
  ↓
Webhook handler:
  ├─ Parse email (from, to, subject, body, thread_id)
  ├─ Find vendor by email address
  ├─ Find event by thread_id
  ├─ Save to vendor_communications (direction: inbound)
  └─ Trigger: POST /api/agent/process-reply
  ↓
Agent processes reply:
  ├─ Read email from database
  ├─ Call Claude to analyze
  ├─ Extract quote or identify questions
  ├─ Decide: save quote OR send follow-up
  └─ Update agent_run progress
```

### **UI Components**

**Button on Event Detail Page:**
```tsx
// On app/(dashboard)/events/[eventId]/page.tsx

After vendor matching section, add:

┌─────────────────────────────────────────┐
│ MATCHED VENDORS                         │
│ ✓ Catering: 3 vendors matched           │
│ ✓ AV: 2 vendors matched                 │
│ ✓ Florals: 4 vendors matched            │
│                                         │
│ [Engage Vendors with AI Agent] ← NEW   │
│                                         │
│ OR manually assign vendors below:       │
│ [Show Vendor Details]                   │
└─────────────────────────────────────────┘
```

**Agent Activity Monitor (Optional Real-time View):**
```tsx
// Component: components/agent/AgentActivityLog.tsx

┌─────────────────────────────────────────┐
│ AI Agent Status: Running... ⚙️          │
├─────────────────────────────────────────┤
│ 🕐 2:14 PM - Started vendor outreach    │
│ 📤 2:14 PM - Sent email to Premier Cat. │
│ 📤 2:15 PM - Sent email to Crystal AV   │
│ 📤 2:15 PM - Sent email to Garden Florals│
│ 📥 2:42 PM - Received reply from Premier │
│ 💰 2:42 PM - Quote extracted: $5,000    │
│ 📥 3:18 PM - Received reply from Crystal │
│ ❓ 3:18 PM - Vendor asked questions      │
│ 📤 3:19 PM - Sent follow-up to Crystal  │
│                                         │
│ Progress: 3/3 contacted, 2/3 responded  │
│ [Pause Agent] [View All Communications] │
└─────────────────────────────────────────┘
```

### **API Endpoints**

**POST `/api/agent/start`**

Request:
```typescript
{
  event_id: string;
  vendor_ids?: string[]; // Optional: specific vendors to contact, otherwise uses matched vendors
}
```

Response:
```typescript
{
  success: boolean;
  agent_run_id: string;
  vendors_targeted: number;
  estimated_completion: string; // ISO timestamp
}
```

**POST `/api/agent/process-reply`**

Request:
```typescript
{
  communication_id: string; // ID of the inbound communication to process
}
```

Response:
```typescript
{
  success: boolean;
  action_taken: "quote_saved" | "follow_up_sent" | "marked_declined";
  quote_id?: string; // If quote was extracted
}
```

**GET `/api/agent/status/:eventId`**

Response:
```typescript
{
  agent_run_id: string;
  status: "running" | "completed" | "failed" | "paused";
  progress: {
    vendors_targeted: number;
    vendors_contacted: number;
    vendors_responded: number;
    quotes_received: number;
  };
  recent_logs: Array<{
    timestamp: string;
    action: string;
    details: string;
  }>;
  started_at: string;
  estimated_completion?: string;
}
```

### **Claude Prompts**

#### **Email Drafting Prompt** (`lib/ai/prompts/emailDrafting.ts`)

```
You are composing a professional email to a vendor on behalf of a venue coordinator.

CONTEXT:
- Venue: {venue_name}
- Event Type: {event_type}
- Event Date: {event_date}
- Guest Count: {guest_count}
- Budget Range: {budget_range}

VENDOR INFORMATION:
- Vendor Name: {vendor_name}
- Category: {vendor_category}

YOUR TASK:
Write a professional outreach email requesting a quote. Include:
1. Brief introduction of the event
2. Specific requirements for this vendor category
3. Request for availability confirmation
4. Request for detailed quote
5. Deadline for response (48 hours)
6. Contact information for questions

TONE: Professional, clear, concise
LENGTH: 150-250 words

Return ONLY the email body (no subject line).
```

#### **Email Analysis Prompt** (`lib/ai/prompts/emailAnalysis.ts`)

```
You are analyzing a vendor's email response to determine next steps.

ORIGINAL REQUEST:
{original_email}

VENDOR'S RESPONSE:
{vendor_reply}

YOUR TASK:
Analyze the vendor's response and return a JSON object:

{
  "response_type": "complete_quote" | "needs_clarification" | "declined" | "partial_info",
  "availability_confirmed": boolean,
  "quote_provided": boolean,
  "quote_details": {
    "total_cost": number | null,
    "breakdown": object | null,
    "deposit_required": number | null,
    "payment_terms": string | null
  },
  "questions_from_vendor": string[], // Questions they asked us
  "missing_information": string[], // Information we need to get a complete quote
  "suggested_followup": string | null // If needs clarification, what should we ask?
}

RULES:
- Only set response_type = "complete_quote" if you have availability AND total cost
- Extract numbers carefully (handle $5,000, 5000, 5k formats)
- If vendor asked questions, set response_type = "needs_clarification"
```

#### **Follow-up Drafting Prompt** (`lib/ai/prompts/followUp.ts`)

```
You are composing a follow-up email to a vendor who asked questions.

PREVIOUS CONVERSATION:
{email_thread}

VENDOR'S QUESTIONS:
{vendor_questions}

ANSWERS TO PROVIDE:
{answers_from_event_data}

YOUR TASK:
Write a brief, professional follow-up email that:
1. Thanks them for their response
2. Answers their questions clearly
3. Requests the quote again
4. Maintains professional tone

LENGTH: 100-150 words
Return ONLY the email body.
```

### **Error Handling**

- **Email send fails**: Log error, retry 3 times, notify user if persistent
- **Claude API fails**: Fallback to manual communication, notify user
- **Vendor email bounces**: Mark vendor as unreachable, suggest backup
- **Quote extraction unclear**: Flag for manual review, show user original email

---

## **FEATURE 10: Communication Dashboard**

### **Overview**
Centralized view for users to monitor all AI agent communications, review email threads, compare vendor quotes, and approve/reject quotes.

### **User Flow**

1. User navigates to event detail page
2. User clicks "View Communications" tab/button
3. System shows communication dashboard with:
   - List of vendors contacted
   - Status of each vendor (Sent, Replied, Quote Received, etc.)
   - Quick actions (View Thread, Approve Quote)
4. User clicks "View Thread" for a vendor
5. System shows full email conversation
6. User clicks "Approve Quote" button
7. System shows confirmation modal
8. User confirms → Quote approved → Vendor assigned to event

### **UI Layout**

**Page: `app/(dashboard)/events/[eventId]/communications/page.tsx`**

```
┌─────────────────────────────────────────────────────────┐
│ Event: Corporate Gala | Dec 15, 2024                    │
│ [← Back to Event]                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ VENDOR COMMUNICATIONS                                   │
│                                                         │
│ [Tab: All] [Tab: Pending] [Tab: Quoted] [Tab: Approved]│
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📧 Premier Catering                                 │ │
│ │ Status: Quote Received ✅                           │ │
│ │ Last activity: 2 hours ago                          │ │
│ │                                                     │ │
│ │ Quote: $5,000 (within budget)                       │ │
│ │ Availability: Confirmed ✓                           │ │
│ │                                                     │ │
│ │ [View Thread] [Approve Quote →] [Reject]           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📧 Crystal AV Systems                               │ │
│ │ Status: Awaiting Reply ⏳                           │ │
│ │ Last activity: Sent 3 hours ago                     │ │
│ │                                                     │ │
│ │ Follow-up sent: Yes (1 hour ago)                    │ │
│ │                                                     │ │
│ │ [View Thread] [Send Manual Email]                   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📧 Garden Florals                                   │ │
│ │ Status: Quote Received ✅                           │ │
│ │ Last activity: 1 day ago                            │ │
│ │                                                     │ │
│ │ Quote: $1,800                                       │ │
│ │ Availability: Confirmed ✓                           │ │
│ │ ⚠️ Expires in 2 days                                │ │
│ │                                                     │ │
│ │ [View Thread] [Approve Quote →] [Reject]           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [+ Contact Additional Vendor]                           │
└─────────────────────────────────────────────────────────┘
```

**Thread View Modal/Page:**

```
┌─────────────────────────────────────────────────────────┐
│ Conversation with Premier Catering                      │
│ [← Back to Communications]                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ OUTBOUND | Nov 25, 2:14 PM                          │ │
│ │ Subject: Quote Request - Corporate Gala Dec 15      │ │
│ │                                                     │ │
│ │ Dear Premier Catering,                              │ │
│ │                                                     │ │
│ │ We are organizing a corporate gala for 300 guests   │ │
│ │ on December 15, 2024...                             │ │
│ │                                                     │ │
│ │ [Full email body]                                   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ INBOUND | Nov 25, 5:42 PM                           │ │
│ │ From: events@premiercatering.com                    │ │
│ │                                                     │ │
│ │ Thank you for reaching out! We would be delighted   │ │
│ │ to cater your corporate gala...                     │ │
│ │                                                     │ │
│ │ Our quote for 300 guests:                           │ │
│ │ - Per person catering: $25 × 300 = $7,500           │ │
│ │ - Setup & service fee: $500                         │ │
│ │ - Total: $8,000                                     │ │
│ │                                                     │ │
│ │ 💰 EXTRACTED QUOTE: $8,000                          │ │
│ │ [Show extracted details ▼]                          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ OUTBOUND | Nov 25, 5:50 PM (AI Agent)              │ │
│ │ Subject: Re: Quote Request - Corporate Gala Dec 15 │ │
│ │                                                     │ │
│ │ Thank you for the quote. However, our budget for    │ │
│ │ catering is $5,000. Can you provide a modified      │ │
│ │ quote that fits this budget?...                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ INBOUND | Nov 26, 10:22 AM                          │ │
│ │ From: events@premiercatering.com                    │ │
│ │                                                     │ │
│ │ We can work within your budget. Here's a revised    │ │
│ │ quote:                                              │ │
│ │ - Per person: $15 × 300 = $4,500                    │ │
│ │ - Service fee: $500                                 │ │
│ │ - Total: $5,000 ✓                                   │ │
│ │                                                     │ │
│ │ 💰 FINAL QUOTE: $5,000                              │ │
│ │ ✅ Within budget                                    │ │
│ │ [Approve This Quote →]                              │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Quote Approval Modal:**

```
┌─────────────────────────────────────────┐
│ Approve Quote from Premier Catering?   │
├─────────────────────────────────────────┤
│                                         │
│ Vendor: Premier Catering                │
│ Category: Catering                      │
│ Total Cost: $5,000                      │
│                                         │
│ Quote Breakdown:                        │
│ • Per person: $15 × 300 = $4,500        │
│ • Service fee: $500                     │
│                                         │
│ Availability: Confirmed for Dec 15      │
│ Payment Terms: 50% deposit required     │
│                                         │
│ ⚠️ This will:                           │
│ • Assign vendor to your event           │
│ • Add $5,000 to event budget            │
│ • Send confirmation email to vendor     │
│                                         │
│ [Cancel] [Confirm Approval]             │
└─────────────────────────────────────────┘
```

### **Status Indicators**

Vendor communication statuses:
- **Not Contacted**: Gray badge - "Ready to contact"
- **Email Sent**: Blue badge - "Waiting for reply"
- **Reply Received**: Yellow badge - "Processing response"
- **Quote Received**: Green badge - "Quote ready for review"
- **Approved**: Dark green badge - "Vendor confirmed"
- **Rejected**: Red badge - "Quote declined"
- **Declined by Vendor**: Orange badge - "Vendor unavailable"
- **Follow-up Sent**: Light blue badge - "Waiting for clarification"

### **Components**

1. **CommunicationDashboard.tsx**
   - Main container
   - Fetches all communications for event
   - Groups by vendor
   - Shows aggregate status

2. **ThreadView.tsx**
   - Shows chronological email thread
   - Highlights extracted quotes
   - Color codes outbound (blue) vs inbound (gray)
   - Shows AI agent actions with robot icon 🤖

3. **EmailMessage.tsx**
   - Individual email card
   - Shows direction, timestamp, sender
   - Expandable/collapsible body
   - Shows "AI Generated" badge if from agent

4. **QuoteCard.tsx**
   - Displays extracted quote details
   - Shows cost breakdown
   - Budget comparison (within/over budget)
   - Approve/Reject buttons
   - Expiration warning if applicable

5. **VendorResponseStatus.tsx**
   - Color-coded status badge
   - Last activity timestamp
   - Action buttons based on status

### **API Endpoints**

**GET `/api/communications?event_id={id}`**

Response:
```typescript
{
  communications: Array<{
    vendor: {
      id: string;
      name: string;
      category: string;
      email: string;
    };
    status: "not_contacted" | "sent" | "replied" | "quote_received" | "approved" | "declined";
    last_activity: string; // ISO timestamp
    email_count: number;
    latest_quote?: {
      id: string;
      total_cost: number;
      status: "pending" | "approved" | "rejected";
    };
  }>;
}
```

**GET `/api/communications/thread?event_id={id}&vendor_id={id}`**

Response:
```typescript
{
  thread: Array<{
    id: string;
    direction: "outbound" | "inbound";
    subject: string;
    body: string;
    from_email: string;
    to_email: string;
    sent_at: string;
    is_ai_generated: boolean;
    extracted_quote?: {
      quote_id: string;
      total_cost: number;
      breakdown: object;
    };
  }>;
  vendor: {
    id: string;
    name: string;
    category: string;
  };
}
```

**POST `/api/quotes/{quoteId}/approve`**

Request:
```typescript
{
  event_id: string;
  notes?: string; // Optional approval notes
}
```

Response:
```typescript
{
  success: boolean;
  message: string;
  event_vendor_id: string; // ID of created event_vendors record
  budget_updated: boolean;
  confirmation_email_sent: boolean;
}
```

Actions performed:
1. Update `vendor_quotes.status = 'approved'`
2. Set `approved_by = current_user_id`
3. Create `event_vendors` record (assign vendor to event)
4. Update `events.budget_breakdown` with quote amount
5. Send confirmation email to vendor (optional)
6. Update `events.actual_spent` if quote is finalized

**POST `/api/quotes/{quoteId}/reject`**

Request:
```typescript
{
  reason: string; // Why quote was rejected
}
```

Response:
```typescript
{
  success: boolean;
  message: string;
}
```

Actions:
1. Update `vendor_quotes.status = 'rejected'`
2. Save rejection reason
3. Optionally notify vendor

### **Real-time Updates (Optional)**

For real-time communication updates, consider:

**Option A: Polling**
- Frontend polls `/api/communications?event_id={id}` every 30 seconds
- Simple to implement
- Works on all platforms

**Option B: Server-Sent Events (SSE)**
- Endpoint: `GET /api/agent/stream?event_id={id}`
- Pushes updates when agent takes actions
- More efficient than polling
- Better UX (instant updates)

Recommended: Start with polling, add SSE later if needed.

### **Filtering & Search**

Allow users to filter communications:
- By status (all, pending, quoted, approved)
- By vendor category
- By date range
- Search by vendor name

---

## **Task 4: Update Environment Variables Section**

Add these new environment variables to the `.env.local` section:

```bash
# Existing variables...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# NEW: AI Services
ANTHROPIC_API_KEY=sk-ant-xxxxx  # Required for Claude API
CLAUDE_MODEL=claude-sonnet-4-20250514  # Specific model version

# NEW: Email Service (Resend)
RESEND_API_KEY=re_xxxxx  # Required for sending emails
RESEND_WEBHOOK_SECRET=whsec_xxxxx  # For verifying webhook signatures
RESEND_FROM_EMAIL=noreply@VenueManager.com  # Sender email address
RESEND_FROM_NAME=VenueManager  # Sender display name

# NEW: Agent Configuration
AGENT_MAX_RETRIES=3  # Max email send retries
AGENT_TIMEOUT_HOURS=72  # Hours before agent gives up on vendor
AGENT_FOLLOWUP_DELAY_HOURS=24  # Wait time before follow-up
ENABLE_AGENT_AUTO_APPROVAL=false  # Auto-approve quotes within budget (dangerous!)

# NEW: Feature Flags (Optional)
ENABLE_NL_EVENT_CREATION=true
ENABLE_AI_AGENT=true
ENABLE_REAL_TIME_UPDATES=false  # SSE for real-time communication updates
```

---

## **Task 5: Update Tech Stack Section**

Update the tech stack list to include:

**Added Dependencies:**
```json
{
  "dependencies": {
    // Existing...
    "@supabase/supabase-js": "^2.x",
    "next": "^14.x",
    
    // NEW: AI & Email
    "@anthropic-ai/sdk": "^0.27.0",  // Claude API client
    "resend": "^4.0.0",  // Email service
    
    // NEW: Agent Infrastructure (Optional)
    "inngest": "^3.0.0",  // Background jobs & webhooks
    "zod": "^3.22.0"  // Schema validation for AI responses
  }
}
```

---

## **Task 6: Add Agent Implementation Guidelines**

Add a new section called "AI Agent Implementation Notes" with these guidelines:

### **Agent Design Principles**

1. **Transparency**: All agent actions must be logged and visible to users
2. **User Control**: Users can pause/stop agent at any time
3. **Fail-Safe**: If agent can't handle a situation, escalate to manual review
4. **Audit Trail**: Keep all emails and decisions in database
5. **Budget Awareness**: Agent should negotiate within user's budget constraints

### **Claude API Usage Patterns**

**Structured Output:**
Always request JSON responses from Claude for data extraction:

```typescript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: 'Extract quote details. Return ONLY valid JSON: {...}'
  }]
});

// Parse response
const data = JSON.parse(response.content[0].text);
```

**Error Handling:**
```typescript
try {
  const result = await callClaudeAPI(prompt);
} catch (error) {
  if (error.status === 429) {
    // Rate limited - retry with backoff
    await sleep(2000);
    return retry();
  } else if (error.status === 500) {
    // Claude API error - fall back to manual
    await notifyUserOfFailure();
    return { requiresManualReview: true };
  }
  throw error;
}
```

### **Email Best Practices**

1. **Thread Management**: Use Resend's thread tracking to group conversations
2. **Personalization**: Always use vendor name, reference event specifics
3. **Clear CTAs**: Every email should have 1 clear call-to-action
4. **Professional Tone**: Claude excels at this, but validate outputs
5. **Tracking**: Add metadata to emails for matching replies to events

### **Quote Extraction Edge Cases**

Handle these scenarios:

- **Partial quotes**: Vendor gives hourly rate but not total → Follow up for total
- **Conditional pricing**: "Price depends on menu choice" → Ask for base price
- **Vague availability**: "We're usually available" → Ask for confirmed date
- **Multiple options**: Vendor offers 3 packages → Save all, let user choose
- **Currency confusion**: Handle $5k, 5000, five thousand → Normalize to number

### **Security Considerations**

1. **Webhook Verification**: Always verify Resend webhook signatures
2. **Email Validation**: Validate vendor email addresses before sending
3. **Rate Limiting**: Don't send >10 emails/minute to avoid spam flags
4. **Data Privacy**: Never log sensitive vendor information (except in secure DB)
5. **User Authorization**: Check user owns event before taking agent actions

---

## **Task 7: Update Development Workflow**

Update the "Development Workflow" section with new steps:

### **Step 5.5: AI & Email Integration** (Insert after Step 5)

1. Set up Anthropic API account
   - Get API key from console.anthropic.com
   - Add to `.env.local`

2. Set up Resend account
   - Create account at resend.com
   - Verify domain (or use resend.dev for testing)
   - Get API key and webhook secret
   - Configure webhook endpoint: `https://your-domain.com/api/webhooks/resend`

3. Test Claude integration
   - Create `lib/ai/claude.ts` client
   - Test event extraction with sample text
   - Verify JSON parsing works correctly

4. Test email sending
   - Send test email via Resend
   - Verify delivery
   - Test webhook reception

5. Build agent orchestrator
   - Implement main agent loop
   - Add logging to database
   - Test with 1 vendor manually

### **Step 6.5: Agent Testing** (Insert after Step 6)

Test scenarios:
- ✅ Agent sends initial emails to 3 vendors
- ✅ Agent receives reply with complete quote → Extracts correctly
- ✅ Agent receives reply with questions → Sends appropriate follow-up
- ✅ Agent receives "not available" → Marks as declined
- ✅ User approves quote → Vendor assigned to event
- ✅ Webhook fails → Agent logs error and retries
- ✅ Claude API fails → Graceful fallback to manual

---

## **Task 8: Add Example Prompts Library**

Create a new section: "Example Claude Prompts for Reference"

### **Event Extraction Examples**

**Input:**
```
"Need to throw a birthday party for my daughter next Saturday. 
Expecting around 50 kids. Budget is about 3 grand. Need a bouncy 
house and catering (pizza and juice boxes)."
```

**Expected Output:**
```json
{
  "event_name": "Birthday Party",
  "event_type": "party",
  "event_date": "2024-12-07",
  "guest_count": 50,
  "budget_total": 3000,
  "required_categories": ["entertainment", "catering"],
  "special_requirements": "Kids party - need bouncy house, pizza, juice boxes",
  "confidence": "high"
}
```

### **Email Drafting Examples**

**Vendor: Catering Company**
**Event: Corporate Gala, 300 guests, $25k budget**

**Output:**
```
Subject: Catering Quote Request - Corporate Gala on December 15

Dear [Vendor Name],

We are organizing a corporate gala on December 15, 2024, at [Venue Name] 
and would like to request a catering quote for this event.

Event Details:
- Type: Formal corporate gala
- Date: December 15, 2024
- Time: 6:00 PM - 10:00 PM
- Guest Count: 300
- Setting: Seated dinner

Requirements:
- Full dinner service (appetizers, entrée, dessert)
- Vegetarian and gluten-free options
- Professional wait staff
- Bar service (beer, wine, non-alcoholic beverages)

Budget Consideration:
We are allocating approximately $7,000-$8,000 for catering services.

Could you please provide:
1. Availability confirmation for December 15th
2. Menu options that fit our requirements
3. Detailed quote including all costs (food, service, rentals)
4. Deposit and payment terms

We would appreciate your response by [48 hours from now] so we can 
finalize our vendor selection.

Thank you for your consideration. Please feel free to reach out with 
any questions.

Best regards,
VenueManager Team
on behalf of [Venue Name]
```

### **Quote Extraction Examples**

**Vendor Email:**
```
Thanks for reaching out! We'd love to cater your event.

For 300 guests, here's what we can offer:

Appetizer station: $1,500
Main course (choice of 3 entrees): $25/person = $7,500
Dessert bar: $1,000
Bar service: $2,000
Service fee: $800

Total: $12,800

We require 50% deposit upfront, balance due 1 week before event.
We're available on Dec 15th!

Let me know if you'd like to move forward.
```

**Expected Extraction:**
```json
{
  "response_type": "complete_quote",
  "availability_confirmed": true,
  "quote_provided": true,
  "quote_details": {
    "total_cost": 12800,
    "breakdown": {
      "appetizers": 1500,
      "main_course": 7500,
      "dessert": 1000,
      "bar_service": 2000,
      "service_fee": 800
    },
    "deposit_required": 6400,
    "deposit_percentage": 50,
    "payment_terms": "50% deposit upfront, balance due 1 week before event"
  },
  "questions_from_vendor": [],
  "missing_information": [],
  "suggested_followup": null
}
```

---

## **Task 9: Add Testing Checklist**

Add a new section: "AI Agent Feature Testing Checklist"

### **Natural Language Event Creation**

- [ ] User can extract event from clear description
- [ ] System handles vague descriptions (shows low confidence)
- [ ] System handles missing fields (prompts user to fill in)
- [ ] Date parsing works for various formats ("next Friday", "12/15", "Dec 15")
- [ ] Budget parsing works ($25k, 25000, "twenty-five thousand")
- [ ] Vendor categories correctly identified
- [ ] User can edit extracted data before saving
- [ ] Fallback to manual form works if extraction fails

### **AI Agent Communication**

- [ ] Agent sends initial emails to all matched vendors
- [ ] Emails are personalized with event details
- [ ] Emails saved to vendor_communications table
- [ ] Webhook receives vendor replies correctly
- [ ] Agent analyzes vendor replies with Claude
- [ ] Complete quotes are extracted and saved
- [ ] Incomplete quotes trigger follow-up emails
- [ ] Agent handles vendor declinations gracefully
- [ ] Agent stops after all vendors respond or timeout
- [ ] Agent logs all actions to agent_runs table
- [ ] Error handling works (API failures, email bounces)
- [ ] Retry logic works for failed emails

### **Communication Dashboard**

- [ ] User can view all vendor communications
- [ ] Status badges show correct states
- [ ] Thread view shows full conversation chronologically
- [ ] AI-generated emails are clearly marked
- [ ] Extracted quotes are highlighted in thread
- [ ] User can approve quotes
- [ ] Approval creates event_vendors record
- [ ] Approval updates event budget
- [ ] User can reject quotes with reason
- [ ] Filtering works (by status, category)
- [ ] Search works (by vendor name)
- [ ] Real-time updates work (if SSE implemented)

### **Integration Testing**

- [ ] End-to-end flow: NL input → Extract → Match → Agent → Quote → Approve
- [ ] Multiple vendors per category handled correctly
- [ ] Budget constraints respected in negotiations
- [ ] Quote expiration warnings shown
- [ ] Agent doesn't contact same vendor twice
- [ ] Concurrent events don't interfere with each other
- [ ] Email threading works across multiple exchanges

---

## **Task 10: Add Cost & Performance Considerations**

Add section: "AI Agent Cost & Performance Optimization"

### **Claude API Costs**

**Per Event (avg 5 vendors):**
- Event extraction: 1 call × $0.003 = $0.003
- Initial outreach drafting: 5 calls × $0.015 = $0.075
- Reply analysis: 5 calls × $0.003 = $0.015
- Follow-up drafting: ~2 calls × $0.015 = $0.030
- **Total per event: ~$0.123**

**At scale (1000 events/month):** ~$123/month

**Optimization strategies:**
1. Cache common email templates (reduces drafting calls)
2. Batch quote extractions if possible
3. Use shorter prompts for simple tasks
4. Consider Claude Haiku for simpler tasks (3x cheaper)

### **Email Costs (Resend)**

**Per Event:**
- Initial outreach: 5 emails
- Vendor replies: 5 emails (inbound - free)
- Follow-ups: ~2 emails
- **Total: ~7 outbound emails per event**

**At scale (1000 events/month):** 7000 emails/month
- Free tier: 3000/month
- Paid tier ($20/month): 50,000/month
- **Cost: $20/month**

### **Performance Targets**

- Event extraction: < 2 seconds
- Email drafting: < 3 seconds
- Quote analysis: < 2 seconds
- Webhook processing: < 1 second
- Thread view load: < 500ms

**Optimization:**
- Cache vendor data in Redis (optional)
- Use database indexes on communication queries
- Paginate long email threads
- Use React Query for client-side caching

---

## **FINAL CHECKLIST FOR CLAUDE CODE**

When implementing these updates:

✅ **Database:**
- [ ] Add 3 new tables (vendor_communications, vendor_quotes, agent_runs)
- [ ] Add RLS policies for all new tables
- [ ] Create indexes for performance
- [ ] Test with Supabase migrations

✅ **Backend:**
- [ ] Create all new API routes (ai/, agent/, communications/, quotes/, webhooks/)
- [ ] Implement Claude API client wrapper
- [ ] Implement Resend email client wrapper
- [ ] Build agent orchestrator with main loop
- [ ] Build quote extractor logic
- [ ] Add webhook handlers with signature verification
- [ ] Add comprehensive error handling and logging

✅ **Frontend:**
- [ ] Add natural language event creation page
- [ ] Build communication dashboard
- [ ] Build thread view component
- [ ] Build quote approval flow
- [ ] Add agent status monitoring (optional)
- [ ] Update event detail page with "Engage Vendors" button

✅ **Configuration:**
- [ ] Add environment variables for Claude API
- [ ] Add environment variables for Resend
- [ ] Update package.json with new dependencies
- [ ] Create AI prompt templates in lib/ai/prompts/

✅ **Testing:**
- [ ] Test event extraction with various inputs
- [ ] Test email sending end-to-end
- [ ] Test webhook reception
- [ ] Test agent loop with real vendors (use test emails)
- [ ] Test quote approval flow
- [ ] Verify RLS prevents unauthorized access

✅ **Documentation:**
- [ ] Update README with new features
- [ ] Document environment variables
- [ ] Add example prompts for reference
- [ ] Create troubleshooting guide for common agent issues

---

## IMPLEMENTATION PRIORITY

Implement in this order:

**Week 1: Foundation**
1. Database schema changes
2. Claude API integration
3. Natural language event extraction

**Week 2: Email Infrastructure**
4. Resend integration
5. Email sending functionality
6. Webhook handling

**Week 3: Agent Core**
7. Agent orchestrator
8. Initial vendor outreach
9. Reply processing

**Week 4: Quote Management**
10. Quote extraction
11. Communication dashboard
12. Quote approval flow

**Week 5: Polish**
13. Error handling
14. Logging & monitoring
15. Testing & bug fixes

---

## NOTES FOR CLAUDE CODE

- **Do NOT hardcode API keys** - always use environment variables
- **Always verify webhooks** - check signatures before processing
- **Log everything** - agent actions must be auditable
- **Fail gracefully** - if AI fails, allow manual fallback
- **Test incrementally** - don't build everything at once
- **Use TypeScript strictly** - define interfaces for all AI responses
- **Follow existing patterns** - match the code style in current PRD
- **Consider edge cases** - vendors might reply in unexpected formats
- **Budget awareness** - agent should respect event budget constraints
- **User control** - users must be able to pause/override agent

---

## END OF INSTRUCTIONS

These instructions should be sufficient for Claude Code to update the PRD and implement all three new features. The implementation follows "Option D" architecture (custom Claude API integration) as discussed.
