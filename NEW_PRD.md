# Product Requirements Document (PRD)
## VenueManager: Public Venue Pages with AI Conversational Booking

**Version:** 1.0  
**Date:** February 10, 2026  
**Owner:** Prashant, SamisenAI  
**Status:** Ready for Development

---

## Executive Summary

VenueManager will add public-facing venue pages with AI-powered conversational inquiry, transforming it from a backend operations tool into a two-sided marketplace. Each venue gets a professional booking page where prospects can view photos, check availability, and engage in natural language conversations with an AI assistant that qualifies leads and generates proposals automatically.

**Core Value Proposition:**
"Get a professional 24/7 AI booking assistant for your venue. Prospects check availability, get instant quotes, and book—while you focus on running great events."

---

## Problem Statement

### Current Pain Points

**For Venues:**
1. Responding to inquiries is time-consuming (10-15 emails per booking)
2. Inquiries come via email, phone, social media—scattered communication
3. Prospects want instant answers about availability/pricing
4. Venues lose bookings to competitors who respond faster
5. Creating custom quotes/proposals takes 30-60 minutes each
6. No professional web presence for event bookings

**For Event Planners/Clients:**
1. Hard to see if venue fits their needs (capacity, amenities)
2. Can't check availability without calling/emailing
3. Takes days to get pricing information
4. Want to compare venues quickly
5. Need to describe complex event requirements

---

## Solution Overview

### Three-Part System

1. **Public Venue Page** - Beautiful, SEO-optimized landing page for each venue
2. **AI Conversational Inquiry** - Natural language chat interface for prospects
3. **Page Management Dashboard** - Backend tools for venue managers to control their public page

---

## Feature Requirements

## PART 1: Public Venue Page

### 1.1 URL Structure & Access

**Requirements:**
- Each venue gets unique URL: `venuemanager.pro/{venue-slug}`
- Venue slug auto-generated from venue name (e.g., "Grand Ballroom" → "grand-ballroom")
- Venue manager can customize slug (within character limits)
- No authentication required to view public page
- Mobile-responsive design (50%+ traffic will be mobile)

**Technical Notes:**
- Use parameterized routing: `/[venueSlug]`
- Check slug uniqueness on creation
- Allow custom domains in future (Phase 2): `events.grandballroom.com`

**Acceptance Criteria:**
- ✅ Public page loads in <2 seconds
- ✅ Works on iOS Safari, Chrome, Firefox
- ✅ Responsive breakpoints: mobile (320px+), tablet (768px+), desktop (1024px+)

---

### 1.2 Hero Section

**Requirements:**

**Visual Elements:**
- Large hero image (venue's primary photo)
- Overlay text with venue name, location, tagline
- Two prominent CTAs: "Check Availability" and "Start Planning"

**Content Fields (managed by venue owner):**
- Venue name (required, max 60 chars)
- Location (city, state) (required)
- Tagline (optional, max 120 chars)
- Hero image (required, min 1920x1080px)

**Design Specs:**
- Hero height: 60vh on desktop, 40vh on mobile
- Text overlay with gradient for readability
- CTAs: Primary button style, centered below headline

**Acceptance Criteria:**
- ✅ Hero image loads with progressive JPEG/WebP
- ✅ Text remains readable on light/dark images (auto-contrast detection)
- ✅ CTAs are keyboard accessible and have clear focus states

---

### 1.3 Photo Gallery

**Requirements:**

**Functionality:**
- Multiple gallery sections with labels:
  - Main Venue (required)
  - Event Spaces (optional)
  - Past Events (optional)
  - Amenities (optional)
- Grid layout: 3 columns desktop, 2 columns tablet, 1 column mobile
- Click any photo → opens full-screen lightbox
- Lightbox: swipe/arrow navigation, zoom, close button, photo caption

**Photo Management:**
- Upload up to 50 photos (Basic tier: 20 photos)
- Supported formats: JPG, PNG, WebP
- Max file size: 10MB per photo
- Auto-optimization: resize to max 2000px width, compress to <500KB
- Drag-and-drop reordering
- Caption per photo (optional, max 200 chars)

**Technical Requirements:**
- Lazy loading (load images as user scrolls)
- CDN delivery for fast loading
- Alt text auto-generated from caption or venue name

**Acceptance Criteria:**
- ✅ Gallery loads 6 photos initially, loads more on scroll
- ✅ Lightbox works with touch gestures (swipe) and keyboard (arrows, Esc)
- ✅ Images never appear stretched or distorted
- ✅ Gallery section hidden if no photos uploaded

---

### 1.4 Venue Details Section

**Requirements:**

**Spaces & Capacity:**
- List of event spaces with capacity info
- Each space shows:
  - Space name (e.g., "Grand Ballroom")
  - Icon representing space type (ballroom, boardroom, outdoor, etc.)
  - Capacity metrics: seated, standing, or custom layout
  - Optional photo thumbnail per space

**Amenities:**
- Checklist of amenities with icons:
  - Built-in AV system
  - WiFi
  - Parking (with space count)
  - Catering kitchen
  - Accessible facilities
  - Climate control
  - Outdoor space
  - Overnight accommodations
  - Custom amenities (venue can add their own)

**Event Types:**
- Tags/badges showing event types venue hosts:
  - Corporate meetings
  - Weddings
  - Conferences
  - Product launches
  - Galas/fundraisers
  - Private parties
  - Custom types

**Content Fields (managed by venue owner):**
- Space name, capacity (seated/standing/theater/custom)
- Amenities (checkboxes + custom text fields)
- Event types (checkboxes + custom tags)
- Optional description text (max 500 chars)

**Design Specs:**
- Use icons from consistent icon library (Lucide or Heroicons)
- Grid layout: 2 columns desktop, 1 column mobile
- Cards with subtle borders/shadows

**Acceptance Criteria:**
- ✅ Spaces displayed in order venue manager sets
- ✅ If no spaces defined, section shows default message
- ✅ Icons render correctly and have alt text
- ✅ Capacity displays formatted numbers (e.g., "500" not "500.0")

---

### 1.5 Interactive Availability Calendar

**Requirements:**

**Functionality:**
- Month-view calendar showing availability
- Color coding:
  - ✅ Green = Available
  - 🟡 Yellow = Tentatively held (soft booking)
  - ❌ Gray = Booked (unavailable)
- Click any date → opens inquiry chat pre-filled with that date
- Navigation: previous/next month arrows
- Show next 12 months by default

**Data Source:**
- Pulls availability from booking calendar in backend
- Real-time updates (if booking is made, calendar updates immediately)
- Respects venue's blackout dates

**Business Rules:**
- Past dates shown as unavailable (grayed out)
- Multi-day events show as unavailable for all dates
- Tentative bookings shown differently than confirmed
- Venue can set buffer days (e.g., 1 day setup/teardown)

**Interaction:**
- Hover on date → shows tooltip with status details
  - Available: "Available for booking"
  - Tentative: "Tentatively held - inquire for details"
  - Booked: "Unavailable"
- Click available date → opens inquiry chat with date pre-filled

**Technical Requirements:**
- API endpoint: `GET /api/venues/{slug}/availability?month=2026-03`
- Returns JSON: `{date: "2026-03-15", status: "available"|"tentative"|"booked"}`
- Calendar caches availability data (5-minute cache)

**Acceptance Criteria:**
- ✅ Calendar loads within 1 second
- ✅ Colors are accessible (color-blind friendly, not relying only on color)
- ✅ Keyboard navigable (tab to dates, enter to select)
- ✅ Mobile: swipe left/right to change months

---

### 1.6 Location & Contact Section

**Requirements:**

**Map Integration:**
- Embedded Google Maps showing venue location
- Pin with venue name
- Option to "Get Directions"

**Contact Information:**
- Address (with link to Google Maps)
- Phone number (click-to-call on mobile)
- Email (with mailto link)
- Business hours (optional)
- Social media links (optional): Facebook, Instagram, LinkedIn

**Content Fields (managed by venue owner):**
- Full address (required)
- Phone (optional but recommended)
- Public email (optional, defaults to inquiry form)
- Hours of operation (optional)
- Social media URLs (optional)

**Privacy Consideration:**
- Venue can choose to hide contact info and force all inquiries through AI chat

**Acceptance Criteria:**
- ✅ Map loads correctly with venue marker
- ✅ Phone numbers formatted properly: (555) 123-4567
- ✅ All links open in new tab (external links)
- ✅ Section hidden if venue opts to hide contact info

---

### 1.7 Testimonials/Reviews (Optional)

**Requirements:**

**Display:**
- Carousel of 3-5 testimonials
- Each shows:
  - Quote (max 250 chars)
  - Client name and company
  - Event type
  - Optional: star rating (5-star scale)
  - Optional: client photo/logo

**Content Management:**
- Venue manager can add/edit/remove testimonials
- Testimonials can be linked to past events in system
- Auto-request testimonial email sent post-event (optional automation)

**Design:**
- Card-based layout with quote icon
- Auto-rotate every 8 seconds
- Manual navigation: prev/next arrows, dots indicator

**Acceptance Criteria:**
- ✅ Carousel pauses on hover
- ✅ Testimonials without ratings display properly
- ✅ Section hidden if no testimonials added

---

### 1.8 Call-to-Action (Footer)

**Requirements:**

**Content:**
- Headline: "Ready to plan your event?"
- Subtext: "Check availability and get a custom quote in minutes"
- Primary CTA: "Start Planning" (opens AI chat)
- Secondary CTA: "Call Us" or "Email Us" (if contact info provided)

**Design:**
- Full-width section with accent background color
- High contrast for accessibility
- Large, prominent buttons

**Acceptance Criteria:**
- ✅ CTAs are keyboard accessible
- ✅ "Start Planning" scrolls to/opens AI chat interface
- ✅ Works consistently across all devices

---

## PART 2: AI Conversational Inquiry System

### 2.1 Chat Interface (Frontend)

**Requirements:**

**Placement:**
- Embedded directly on page (below fold, in dedicated section)
- Alternative: Floating chat widget (bottom-right corner)
- Opens full chat interface when clicked

**Chat UI Components:**
- Large text input field (multiline, auto-expanding)
- Placeholder text: "Describe your event in your own words..."
- Example suggestions above input:
  - "I need a venue for 100 people in May"
  - "Corporate retreat for 2 days, 80 attendees"
  - "Wedding reception, 200 guests, September"
- Send button (or Enter to send, Shift+Enter for new line)
- Chat history shows user messages vs AI messages (different styling)
- Typing indicator when AI is generating response
- Scroll to latest message automatically

**Message Types:**
- User text messages
- AI text responses
- AI suggested action buttons ("Check these dates", "Get a quote", "Speak to manager")
- AI-generated structured data cards (pricing summary, available dates)

**Accessibility:**
- Fully keyboard navigable
- Screen reader compatible (ARIA labels)
- Focus management (when chat opens, focus goes to input)

**Technical Requirements:**
- Built with React/Vue component
- WebSocket or Server-Sent Events for real-time updates
- Message history stored in session (persists on page reload)
- Mobile: full-screen chat on small screens

**Acceptance Criteria:**
- ✅ User can type and send messages
- ✅ AI responses appear within 3 seconds
- ✅ Typing indicator shows while waiting
- ✅ Chat scrolls to show latest message
- ✅ Works on mobile without keyboard covering interface

---

### 2.2 AI Conversation Engine (Backend)

**Requirements:**

**Core Functionality:**
- Parse natural language inquiry
- Extract structured data: event type, date, guest count, budget, special requirements
- Check venue availability against calendar
- Provide pricing estimates based on venue's packages
- Generate intelligent, contextual responses
- Handle multi-turn conversations (ask clarifying questions)
- Determine when to hand off to human

**AI Model:**
- Use Claude API (Anthropic) or GPT-4 (OpenAI)
- Custom system prompt per venue with:
  - Venue details (name, capacity, amenities, pricing)
  - Current availability (next 6-12 months)
  - Pricing rules and packages
  - Tone/brand voice (professional, friendly, etc.)
  - Constraints (what AI can/cannot promise)

**Conversation Flow:**

**Stage 1: Initial Understanding**
```
User: "I need a venue for a corporate event in March"

AI extracts:
- Event type: Corporate
- Timeframe: March 2026
- Status: Needs more info (guest count, specific dates)

AI responds:
"Great! I'd be happy to help with your corporate event in March. 
To check availability and provide accurate pricing, could you tell me:
- How many attendees?
- Any specific dates in March you're considering?"
```

**Stage 2: Qualification**
```
User: "About 120 people, thinking March 15th"

AI extracts:
- Guest count: 120
- Specific date: March 15, 2026

AI checks:
- Capacity: Grand Ballroom holds 500 ✓
- Availability: March 15 is available ✓

AI responds:
"Perfect! March 15th is available, and our Grand Ballroom is ideal for 120 guests.

📅 Date: March 15, 2026
👥 Capacity: Grand Ballroom (120 seated)
💰 Estimated Package: $8,500-10,000
   Includes: Venue rental, tables/chairs, basic AV

What type of setup do you need?
[Theater Style] [Banquet Rounds] [Cocktail Reception]"
```

**Stage 3: Refinement**
```
User: "Banquet rounds, and we'll need catering"

AI responds:
"Excellent choice! For 120 guests with banquet rounds and catering:

Updated Estimate:
- Venue & setup: $3,500
- Catering (per person): $45-65
- Total: $8,900-11,300

We offer three catering tiers:
1. Continental: $45/person (sandwiches, salads, beverages)
2. Plated Dinner: $55/person (entree, sides, dessert)
3. Premium: $65/person (multi-course, premium options)

Ready for a detailed proposal?"
```

**Stage 4: Conversion**
```
User: "Yes, send proposal to john@company.com"

AI responds:
"Perfect! I'm generating a detailed proposal for your March 15th event and sending it to john@company.com.

Our event manager Sarah will review your request and follow up within 24 hours to discuss next steps.

📧 Proposal sent to: john@company.com
🔖 Your reference number: INQ-2026-0247

Is there anything else you'd like to know about the venue?"

Backend actions:
✓ Create lead in CRM
✓ Generate proposal PDF
✓ Email proposal to john@company.com
✓ Notify venue manager (Sarah)
✓ Store conversation transcript
```

**Edge Cases to Handle:**

**Date unavailable:**
```
User: "March 15th"

AI: "I checked our calendar, and March 15th is already booked. 
Here are nearby available dates:
- March 12 (Tue) ✓
- March 13 (Wed) ✓  
- March 18 (Mon) ✓
- March 19 (Tue) ✓

Would any of these work for you?"
```

**Out of capacity:**
```
User: "I need space for 600 people"

AI: "Our Grand Ballroom holds up to 500 people seated. For 600 guests, 
I'd recommend:

Option 1: Use both Grand Ballroom (300) + Garden Terrace (300)
Option 2: Consider a cocktail/standing reception (we can fit 800 standing)

Which format are you considering?"
```

**Budget too low:**
```
User: "What's your cheapest package for 100 people?"

AI: "For 100 guests, our starting package is $6,500, which includes:
- Venue rental (4 hours)
- Tables, chairs, linens
- Basic AV setup

This doesn't include catering. Would you like to see what's included 
in our mid-tier package for better value?"
```

**Too complex / needs human:**
```
User: "We need overnight rooms for 80 people, shuttle service, 
custom stage setup, live band area, VIP section, and special lighting..."

AI: "This sounds like an exciting event with some unique requirements! 
For complex setups like this, I'd recommend speaking directly with 
our event manager Sarah.

I've captured all your details. Would you prefer:
[Schedule a Call] [Have Sarah Email You] [Continue Chat]"
```

**Technical Requirements:**

**AI System Prompt Template:**
```
You are the AI booking assistant for {venue_name}, a {venue_type} 
in {city}, {state}.

VENUE CAPACITY:
{spaces_with_capacities}

AMENITIES:
{amenities_list}

PRICING STRUCTURE:
Base venue rental: {base_price}
Catering per person: {catering_range}
AV package: {av_price}
[Additional packages...]

CURRENT AVAILABILITY:
{available_dates_json}

CONVERSATION GUIDELINES:
1. Always be warm, professional, and helpful
2. Ask clarifying questions when needed
3. Provide pricing as "estimated ranges" not exact quotes
4. Never commit to final pricing without venue manager approval
5. Check availability before suggesting dates
6. If inquiry is too complex, recommend human consultation
7. Always capture: name, email, event date, guest count
8. End each response with clear next step

RESPONSE FORMAT:
- Use natural conversational tone
- Use emojis sparingly (📅 💰 ✓ for emphasis)
- Break up long responses with line breaks
- Offer specific options when possible (buttons/choices)
- Maximum 3 paragraphs per response (be concise)

ESCALATION TRIGGERS:
- Guest count exceeds capacity by >20%
- Event is less than 2 weeks away
- Budget discussion becomes contentious
- User requests custom contract terms
- Multiple vendors coordination needed
- User seems frustrated or confused

When escalating, say:
"Let me connect you with {manager_name}, our event manager, 
who can give you personalized attention for this request."

CURRENT CONVERSATION:
{conversation_history}

USER MESSAGE:
{user_message}

YOUR RESPONSE:
```

**API Endpoints:**

```
POST /api/venues/{slug}/chat
Request:
{
  "message": "I need a venue for 100 people in March",
  "conversation_id": "uuid-or-null-for-new",
  "user_email": "optional@email.com"
}

Response:
{
  "conversation_id": "uuid",
  "ai_response": "Great! I'd be happy to help...",
  "extracted_data": {
    "event_type": "corporate",
    "guest_count": 100,
    "timeframe": "March 2026",
    "confidence": 0.85
  },
  "suggested_actions": [
    {
      "label": "Check March 15",
      "action": "check_availability",
      "payload": {"date": "2026-03-15"}
    }
  ],
  "should_create_lead": false,
  "escalate_to_human": false
}
```

**Data Extraction Schema:**

```json
{
  "event_type": "corporate|wedding|social|conference|gala|other",
  "event_subtype": "string (e.g., 'product launch', 'annual meeting')",
  "guest_count": "integer or range (e.g., '100-120')",
  "date": "YYYY-MM-DD or null",
  "date_flexibility": "exact|flexible|date_range",
  "budget": "integer or null",
  "requirements": {
    "catering": true|false,
    "av_setup": true|false,
    "overnight_rooms": true|false,
    "outdoor_space": true|false,
    "alcohol_service": true|false,
    "custom": ["string array of other requirements"]
  },
  "contact_info": {
    "name": "string or null",
    "email": "string or null",
    "phone": "string or null",
    "company": "string or null"
  },
  "urgency": "high|medium|low",
  "confidence_score": 0.0-1.0
}
```

**Acceptance Criteria:**
- ✅ AI extracts event details with >85% accuracy
- ✅ AI checks availability correctly (0 errors)
- ✅ AI response time < 3 seconds (p95)
- ✅ AI escalates complex inquiries appropriately
- ✅ Conversation flows naturally across multiple turns
- ✅ AI never invents availability or pricing not in system

---

### 2.3 Lead Capture & CRM Integration

**Requirements:**

**When to Create Lead:**

**Automatic lead creation triggers:**
1. User provides email address in conversation
2. User requests proposal/quote
3. User clicks "Speak to manager"
4. User requests to schedule tour
5. Conversation reaches 5+ messages (indicates serious interest)
6. AI confidence score for booking intent >70%

**Lead Data Captured:**

```json
{
  "lead_id": "uuid",
  "venue_id": "uuid",
  "source": "ai_chat",
  "status": "new",
  "contact_info": {
    "name": "John Anderson",
    "email": "john@company.com",
    "phone": "+1-555-123-4567",
    "company": "Microsoft"
  },
  "event_details": {
    "type": "corporate_retreat",
    "date": "2026-03-15",
    "date_is_flexible": false,
    "guest_count": 120,
    "estimated_budget": "10000-12000",
    "requirements": ["catering", "av_setup", "banquet_rounds"]
  },
  "ai_conversation": {
    "conversation_id": "uuid",
    "message_count": 7,
    "transcript": "[full conversation text]",
    "extracted_data": {/* structured data */},
    "ai_confidence_score": 0.87,
    "recommended_package": "corporate_premium"
  },
  "priority_score": 85,
  "next_action": "send_proposal",
  "assigned_to": "sarah@venue.com",
  "created_at": "2026-02-10T14:30:00Z"
}
```

**Integration Points:**

1. **Create Lead in CRM:**
   - API call to lead management system
   - Appears in venue manager's dashboard immediately
   - Tagged with source: "Website - AI Chat"

2. **Notification to Venue Manager:**
   - Email notification with lead summary
   - SMS notification for high-priority leads (optional)
   - Push notification in dashboard (if manager is logged in)

3. **Automated Actions:**
   - If email provided → Send confirmation email to prospect
   - If proposal requested → Generate and email proposal PDF
   - If tour requested → Send Calendly link or booking options
   - Schedule follow-up task (24 hours later)

**Email Templates:**

**To Prospect (Confirmation):**
```
Subject: We received your inquiry - {Venue Name}

Hi John,

Thank you for your interest in {Venue Name} for your event on March 15, 2026!

I've reviewed your inquiry for a corporate event with 120 guests, 
and I'm excited to help make it a success.

Our event manager Sarah will follow up within 24 hours to discuss 
details and answer any questions.

In the meantime, here's what we'll prepare for you:
• Detailed proposal with pricing
• Floor plans and setup options
• Availability confirmation
• Next steps

Your inquiry reference: INQ-2026-0247

Looking forward to working with you!

Best regards,
{Venue Name} Team

---
Questions? Reply to this email or call us at (555) 123-4567
```

**To Venue Manager (Lead Alert):**
```
Subject: 🔥 HIGH PRIORITY: New event inquiry - $10K+ opportunity

NEW INQUIRY - Action Required

Event Details:
📅 Date: March 15, 2026
👥 Guests: 120 people
💰 Est. Value: $10,000-12,000
🏢 Company: Microsoft
📧 Contact: john@company.com

Event Type: Corporate Retreat
Requirements: Catering, AV setup, banquet rounds

AI Confidence Score: 87/100 (High Intent)
Priority: HIGH - Respond within 24 hours

[View Full Lead] [View Conversation] [Send Proposal]

AI Recommendation:
This lead is highly qualified. Recommend sending our Corporate Premium 
package proposal and scheduling a site tour within 48 hours.

---
This inquiry was captured via AI chat on your venue page.
```

**Acceptance Criteria:**
- ✅ Lead created automatically when trigger conditions met
- ✅ Lead includes full conversation transcript
- ✅ Venue manager receives notification within 30 seconds
- ✅ Prospect receives confirmation email within 1 minute
- ✅ No duplicate leads created for same conversation
- ✅ Lead priority score calculated accurately

---

### 2.4 Proposal Generation (AI-Assisted)

**Requirements:**

**Trigger:**
- User says "send proposal" or "get a quote"
- User provides email address
- AI has sufficient information (event type, date, guest count)

**Proposal Contents:**

**Generated Automatically:**
1. **Cover Page:**
   - Venue logo and branding
   - Proposal title: "Event Proposal for {Company Name}"
   - Date generated
   - Proposal ID/reference number
   - Valid until date (default: 30 days)

2. **Event Summary:**
   - Event type
   - Date and time
   - Guest count
   - Event contact (name, email, phone)

3. **Venue Details:**
   - Space(s) recommended (with capacity)
   - Floor plan/layout diagram
   - Photos of recommended space
   - Amenities included

4. **Pricing Breakdown:**
   - Venue rental fee
   - Per-person costs (catering, etc.)
   - Add-ons (AV, decorations, etc.)
   - Subtotal
   - Tax
   - Total estimated cost
   - Deposit required (amount and due date)
   - Payment schedule

5. **What's Included:**
   - Detailed list of inclusions per package
   - Setup and breakdown times
   - Staff support included

6. **Policies & Terms:**
   - Cancellation policy
   - Rescheduling policy
   - Payment terms
   - Liability/insurance requirements

7. **Next Steps:**
   - How to accept proposal
   - Booking process
   - Contact information
   - CTA: "Book Now" or "Schedule Tour"

**AI Generation Logic:**

**Package Selection:**
- AI analyzes event requirements
- Matches to venue's packages (basic/standard/premium)
- Suggests most appropriate package with reasoning

**Pricing Calculation:**
```python
base_venue_rental = calculate_by_guest_count_and_hours(120, 4)
catering_cost = guest_count * per_person_rate[package_tier]
av_setup = check_if_requested() ? av_package_price : 0
decorations = check_if_requested() ? decoration_package_price : 0

subtotal = base_venue_rental + catering_cost + av_setup + decorations
tax = subtotal * tax_rate
total = subtotal + tax
deposit = total * deposit_percentage
```

**Customization by Venue Manager:**
- Venue sets default packages and pricing rules
- Can create custom line items
- Can override AI-generated pricing
- Can customize proposal template (logo, colors, terms)

**Delivery:**
- Generate PDF
- Email to prospect with subject: "Your Event Proposal from {Venue Name}"
- Store in lead record
- Allow venue manager to review/edit before sending (optional setting)

**Proposal Status Tracking:**
- Sent
- Viewed (if tracking pixel enabled)
- Accepted
- Declined
- Expired

**Acceptance Criteria:**
- ✅ Proposal generates in <5 seconds
- ✅ PDF is professionally formatted and printable
- ✅ Pricing calculations are 100% accurate
- ✅ Proposal email delivers within 1 minute
- ✅ Venue manager can preview before sending
- ✅ Tracking shows when prospect opens proposal

---

## PART 3: Page Management Dashboard (Backend)

### 3.1 Page Editor Interface

**Location:** 
- Navigate to: Dashboard → My Venues → [Select Venue] → "Edit Public Page"
- Or: Dashboard → Public Page → Edit

**Requirements:**

**Visual Editor Style:**
- Live preview (WYSIWYG): left panel = editor, right panel = live preview
- Changes reflect immediately in preview
- "Publish" button to make changes live

**Sections to Edit:**

#### 3.1.1 Basic Information

**Fields:**
- ✏️ Venue Name (text, required, max 60 chars)
- ✏️ Tagline (text, optional, max 120 chars)
  - Help text: "Short description that appears in search results"
- ✏️ Location (address autocomplete, required)
  - Street address
  - City, State, ZIP
  - Auto-geocode for map placement
- ✏️ Public Page URL slug (text, lowercase, no spaces)
  - Shows: `venuemanager.pro/{slug}`
  - Validates uniqueness in real-time
  - Auto-suggests slug from venue name
- 🔘 Page Status:
  - Published (live, publicly accessible)
  - Draft (saved but not public)
  - Unpublished (take page offline temporarily)

**Acceptance Criteria:**
- ✅ URL slug validation shows error if already taken
- ✅ Address autocomplete uses Google Places API
- ✅ Changes save as draft automatically (every 30 seconds)
- ✅ "Publish" button disabled if required fields missing

---

#### 3.1.2 Photos & Media

**Hero Image Upload:**
- Click to upload or drag-and-drop
- Shows current hero image
- Recommended size: 1920x1080px (landscape)
- Crop tool: allows user to crop/reposition image
- Replace or delete

**Gallery Management:**
- Create gallery sections:
  - "Add Section" button → name the section (e.g., "Main Ballroom")
- Per section:
  - Upload multiple photos (bulk upload)
  - Drag-and-drop to reorder
  - Click photo to edit:
    - Caption (optional, max 200 chars)
    - Alt text (for accessibility)
    - Delete photo
  - Set one photo as section thumbnail

**Photo Limits:**
- Basic tier: 20 photos total
- Professional tier: 50 photos
- Premium tier: Unlimited

**Upload Interface:**
- Shows upload progress
- Displays file size warnings (>10MB)
- Auto-compresses images >2MB
- Shows preview after upload

**Acceptance Criteria:**
- ✅ Bulk upload works for 10+ photos at once
- ✅ Drag-and-drop reordering is smooth (no lag)
- ✅ Photo crops save without quality loss
- ✅ Uploaded photos appear in preview immediately
- ✅ Error messages clear for invalid file types

---

#### 3.1.3 Venue Details Editor

**Spaces & Capacity:**
- "Add Space" button
- Per space:
  - Space name (text, required)
  - Space type (dropdown: Ballroom, Conference Room, Boardroom, Outdoor, Other)
  - Icon (auto-selected based on type, can override)
  - Capacity options:
    - Seated: [number]
    - Standing: [number]
    - Theater style: [number]
    - Custom layout: [number] (with custom label)
  - Optional photo for this space
  - Optional description (max 250 chars)
  - Reorder spaces (drag-and-drop)
  - Delete space

**Amenities Checklist:**
- Pre-defined checkboxes:
  - ☐ Built-in AV system
  - ☐ High-speed WiFi
  - ☐ Parking (with field: number of spaces)
  - ☐ On-site catering kitchen
  - ☐ Accessible facilities (ADA compliant)
  - ☐ Climate controlled
  - ☐ Outdoor space
  - ☐ Green room / prep area
  - ☐ Stage / performance area
  - ☐ Dance floor
  - ☐ Bar area
  - ☐ Overnight accommodations
- "Add Custom Amenity" → text field for unique amenities

**Event Types:**
- Multi-select checkboxes:
  - ☐ Corporate meetings & conferences
  - ☐ Weddings
  - ☐ Galas & fundraisers
  - ☐ Product launches
  - ☐ Private parties
  - ☐ Trade shows
  - ☐ Workshops & training
- "Add Custom Type" → text field

**About Section:**
- Rich text editor (WYSIWYG)
- Max 1,000 characters
- Supports: bold, italic, bullet lists, links
- Preview formatting in real-time

**Acceptance Criteria:**
- ✅ Can add unlimited spaces
- ✅ Capacity numbers accept only integers
- ✅ Custom amenities save and display correctly
- ✅ Rich text editor doesn't break on special characters
- ✅ Changes reflect in preview pane immediately

---

#### 3.1.4 Availability & Calendar Settings

**Calendar Integration:**
- Shows: "Your public calendar is synced with your booking calendar"
- Toggle: "Show real-time availability on public page"
  - ON: Public calendar shows actual availability
  - OFF: Public calendar hidden (inquiries only)

**Buffer Settings:**
- Setup buffer: [number] days before event
- Teardown buffer: [number] days after event
- Explanation: "Blocks additional days around bookings"

**Blackout Dates:**
- "Add Blackout Date" button
- Select date range
- Reason (optional, for internal notes)
- Blackout dates shown as unavailable on public calendar

**Lead Time Settings:**
- Minimum advance booking: [number] days
  - Example: "Require at least 14 days notice for bookings"
- Maximum advance booking: [number] months
  - Example: "Accept bookings up to 12 months in advance"

**Acceptance Criteria:**
- ✅ Blackout dates immediately mark calendar as unavailable
- ✅ Buffer days correctly block adjacent dates
- ✅ Minimum lead time prevents inquiries for dates too soon
- ✅ Settings sync with main booking calendar in real-time

---

#### 3.1.5 Pricing & Packages

**Package Builder:**

**Create Package:**
- "Add Package" button
- Package fields:
  - Package name (e.g., "Basic", "Premium", "Corporate")
  - Package description (max 500 chars)
  - Display on public page: Yes/No
  - Base price (required)
  - Pricing model:
    - Flat rate (one price regardless)
    - Per person (price × guest count)
    - Per hour (price × duration)
    - Tiered pricing (different rates for guest count ranges)

**Tiered Pricing Example:**
```
Package: Corporate Event Package

Base venue rental: $2,000
Per person catering:
  1-50 guests: $50/person
  51-100 guests: $45/person
  101-200 guests: $40/person
  200+ guests: $38/person
```

**Inclusions:**
- Checkboxes for what's included:
  - Venue rental (hours)
  - Tables and chairs
  - Linens (color options)
  - Basic AV setup
  - Setup and cleanup
  - On-site coordinator
  - Parking
  - Custom items (add text field)

**Add-Ons:**
- Additional items clients can add:
  - Name (e.g., "Premium bar package")
  - Price
  - Description
  - Available with which packages (can restrict)

**Pricing Display Settings:**
- Show exact pricing on public page: Yes/No
  - If NO: Shows "Starting at $X" or "Contact for pricing"
- Show pricing breakdown in AI chat: Yes/No
- Require venue manager approval before sending quote: Yes/No

**AI Pricing Guidance:**
- Toggle: "Let AI suggest packages during chat"
- AI rules:
  - Small events (< 50 guests) → Suggest basic package
  - Medium events (50-150) → Suggest standard package
  - Large events (150+) → Suggest premium package
  - Corporate keywords → Suggest corporate package
  - Wedding keywords → Suggest wedding package

**Acceptance Criteria:**
- ✅ Tiered pricing calculates correctly in AI quotes
- ✅ Add-ons appear as options during AI chat
- ✅ Package display toggle works (show/hide on public page)
- ✅ Pricing updates in AI chat within 1 minute of saving
- ✅ Venue manager can override AI-suggested packages

---

#### 3.1.6 AI Chat Settings

**AI Behavior Configuration:**

**Tone & Voice:**
- Dropdown: Professional | Friendly | Casual | Luxury | Custom
- If Custom → text field: "Describe your venue's communication style"
  - Example: "We're a historic venue with elegant service. Be warm but formal."

**Response Length:**
- Radio buttons:
  - Concise (1-2 sentences)
  - Balanced (2-3 paragraphs) ← Default
  - Detailed (longer explanations)

**Proactive Features:**
- ☐ Suggest alternative dates if requested date unavailable
- ☐ Upsell add-ons during conversation (premium packages, extras)
- ☐ Mention promotions/special offers (if any set)
- ☐ Request contact info after 3 messages
- ☐ Offer to send proposal automatically when inquiry is qualified

**Escalation Rules:**
- "Escalate to human when..."
  - ☐ Guest count exceeds venue capacity by [X]%
  - ☐ Event is less than [X] days away
  - ☐ User mentions budget concerns
  - ☐ User asks complex custom questions
  - ☐ User seems frustrated (negative sentiment)
  - ☐ After [X] messages with no resolution

**Greeting Message:**
- Text field: Customize AI's opening message
- Default: "Hi! I'm here to help you plan your event at {Venue Name}. Tell me about what you're planning!"
- Character limit: 200

**After-Hours Behavior:**
- Set business hours: [Start time] to [End time], [Days of week]
- After-hours message: 
  - Default: "Thanks for your inquiry! We're currently closed but I can still help you get started..."
  - Or: Custom message

**Contact Capture:**
- When to ask for email:
  - After [X] messages (default: 3)
  - When user requests proposal
  - When user checks specific date
  - Only when user explicitly volunteers it

**Acceptance Criteria:**
- ✅ Tone changes reflect in AI responses immediately
- ✅ Escalation rules trigger correctly
- ✅ Custom greeting appears as first message in chat
- ✅ After-hours message shows outside business hours
- ✅ AI asks for email at appropriate time per settings

---

#### 3.1.7 Contact Information & Social

**Public Contact Details:**
- Phone number (formatted, click-to-call)
- Public email (or hide and use inquiry form only)
- Business hours:
  - Days of week checkboxes
  - Hours per day (start/end time)
  - Or "By appointment only"

**Social Media Links:**
- Facebook page URL
- Instagram handle
- LinkedIn company page
- Twitter/X handle
- YouTube channel
- TikTok (optional)

**Map Settings:**
- Show map on public page: Yes/No
- Google Maps embed
- Custom pin marker (optional - upload custom icon)

**Privacy Options:**
- ☐ Hide exact address (show only city/neighborhood)
- ☐ Hide phone number (inquiries via form only)
- ☐ Hide email (inquiries via form only)

**Acceptance Criteria:**
- ✅ Phone numbers auto-format correctly
- ✅ Social media links validate (must be valid URLs)
- ✅ Map updates when address changes
- ✅ Privacy settings hide info on public page
- ✅ "By appointment only" shows correctly

---

#### 3.1.8 SEO & Marketing

**Search Engine Optimization:**
- Page title (shown in browser tab): Auto-generated or custom
  - Default: "{Venue Name} - Event Venue in {City}"
  - Custom: Text field, max 60 chars
- Meta description (shown in search results): Auto-generated or custom
  - Default: Generated from venue details
  - Custom: Text field, max 160 chars
- Keywords (optional): Comma-separated
  - Example: "corporate events, wedding venue, Dallas event space"

**Preview:**
- Shows Google search result preview
- Updates in real-time as you type

**Social Sharing:**
- Open Graph image (for Facebook/LinkedIn shares)
  - Default: Hero image
  - Or: Upload custom image (1200x630px)
- Twitter Card settings (optional)

**Analytics:**
- Toggle: "Enable analytics for this page"
- If enabled:
  - Tracks page views
  - Tracks inquiry starts (chat opened)
  - Tracks inquiry submissions (lead created)
  - Shows in dashboard analytics

**Tracking Scripts (Advanced):**
- Google Analytics tracking ID (optional)
- Facebook Pixel ID (optional)
- Custom HTML/JS for header/footer (for marketing tools)

**Acceptance Criteria:**
- ✅ SEO preview matches actual Google display
- ✅ Meta tags properly set in page HTML
- ✅ Social share images display correctly on Facebook/LinkedIn
- ✅ Analytics tracks page views accurately
- ✅ Tracking scripts load without breaking page

---

#### 3.1.9 Testimonials & Social Proof

**Testimonial Manager:**
- "Add Testimonial" button
- Per testimonial:
  - Client quote (text, max 300 chars)
  - Client name (text, required)
  - Client company (text, optional)
  - Event type (dropdown: Corporate, Wedding, etc.)
  - Star rating (1-5 stars, optional)
  - Client photo or logo (optional, max 500KB)
  - Date of event (optional, for "Hosted in June 2025")
  - Display order (drag-and-drop)
  - Published: Yes/No (toggle)

**Bulk Import:**
- "Import from Google Reviews" (if venue has Google Business)
- "Import from Past Events" (select from event history)

**Display Settings:**
- Show testimonials section: Yes/No
- Layout style:
  - Carousel (auto-rotate)
  - Grid (static display)
  - List (vertical layout)
- Auto-rotate speed (if carousel): 5/8/10 seconds

**Request Automation:**
- Toggle: "Auto-request testimonials after events"
- Settings:
  - Send request [X] days after event ends
  - Email template editor
  - Testimonial submission form (public link)

**Acceptance Criteria:**
- ✅ Drag-and-drop reordering works smoothly
- ✅ Star ratings display correctly (filled/empty stars)
- ✅ Testimonials can be unpublished without deleting
- ✅ Auto-request emails send on schedule
- ✅ Public submission form creates unpublished testimonials for review

---

### 3.2 Page Preview & Publishing

**Preview Functionality:**

**Live Preview Pane:**
- Right-side panel in editor shows live preview
- Updates in real-time as changes are made
- Device preview modes:
  - Desktop (full width)
  - Tablet (768px)
  - Mobile (375px)
- Toggle button to switch between device views

**Preview in New Tab:**
- "Preview" button opens full preview in new tab
- URL: `venuemanager.pro/{slug}?preview=true&token={auth_token}`
- Shows unpublished changes
- Shareable link (expires in 24 hours)
  - Share with team members for feedback
  - "Copy Preview Link" button

**Publishing Workflow:**

**Publish Button:**
- Located top-right of editor
- Button states:
  - "Publish" (if never published)
  - "Publish Changes" (if published but has edits)
  - "Published ✓" (no pending changes)
- Keyboard shortcut: Cmd/Ctrl + P

**Pre-Publish Checklist:**
- When clicking Publish, show modal:
  - ✅ Hero image uploaded
  - ✅ At least 5 photos in gallery
  - ✅ Venue details complete (spaces, amenities)
  - ✅ Pricing packages configured
  - ✅ AI chat settings configured
  - ⚠️ No SEO description (warning, not blocker)
  - [Cancel] [Publish Anyway]

**Version History:**
- "View History" button
- Shows last 10 published versions
- Per version:
  - Timestamp
  - User who published
  - Summary of changes (auto-generated)
  - "Restore this version" button

**Unpublish Page:**
- "Unpublish" option in settings
- Confirmation modal: "This will take your page offline. Are you sure?"
- Unpublished pages show "This page is not currently available" to public
- Venue manager can still access editor

**Acceptance Criteria:**
- ✅ Preview updates instantly (<500ms delay)
- ✅ Device preview accurately represents responsive design
- ✅ Preview link works when shared (auth token valid)
- ✅ Publish checklist catches missing required content
- ✅ Version restore works correctly
- ✅ Unpublished pages return 404 or "offline" message to public

---

### 3.3 Page Analytics Dashboard

**Location:** Dashboard → My Venues → [Venue] → "Page Analytics"

**Requirements:**

**Overview Metrics (Cards):**
- 👁️ Page Views (last 30 days)
  - Trend: +12% vs previous 30 days
- 💬 Inquiries Started (chat opened)
  - Trend indicator
- 📧 Leads Captured (contact info collected)
  - Trend indicator
- 📊 Conversion Rate (leads / page views)
  - Benchmark: "Above average for your tier"

**Traffic Sources:**
- Chart showing where visitors came from:
  - Direct (typed URL)
  - Google Search
  - Social Media (Facebook, Instagram, LinkedIn)
  - Referral (from other websites)
  - Email campaigns
- Top 5 referral sources (clickable to see detail)

**Visitor Behavior:**
- Average time on page
- Scroll depth (how far down page visitors scroll)
  - % of visitors who see each section:
    - Hero: 100%
    - Gallery: 85%
    - Venue Details: 72%
    - Availability Calendar: 58%
    - Contact Form: 45%
- Most clicked elements:
  - "Check Availability" button: 234 clicks
  - Phone number: 89 clicks
  - Gallery photo #3: 76 clicks

**Inquiry Analytics:**
- Total inquiries (last 30 days)
- Inquiry sources:
  - AI chat: 85%
  - Contact form: 10%
  - Phone calls: 5%
- Average time to first response (venue manager reply)
- Inquiry conversion rate (inquiries → bookings)

**AI Chat Performance:**
- Total conversations started
- Average messages per conversation
- Conversations that ended with lead capture: X%
- Conversations that escalated to human: X%
- Most common questions asked (word cloud or list)
- Average AI response time

**SEO Performance:**
- Search impressions (how many times page appeared in search)
- Click-through rate from search
- Average search position
- Top search keywords:
  1. "dallas corporate event venue" (position 8)
  2. "wedding venues dallas downtown" (position 15)
  3. "grand ballroom events" (position 3)

**Date Range Selector:**
- Last 7 days
- Last 30 days
- Last 90 days
- Custom date range

**Export Options:**
- "Export Report" button
- Formats: PDF, CSV, Excel
- Includes all metrics and charts

**Acceptance Criteria:**
- ✅ Metrics update in near real-time (5-minute delay max)
- ✅ Charts are interactive (hover to see exact numbers)
- ✅ Date range selector updates all metrics correctly
- ✅ Export includes all visible data
- ✅ Mobile-responsive dashboard layout

---

### 3.4 Lead Management Integration

**Requirements:**

**Lead Notification Settings:**

**In-App Notifications:**
- Real-time notification badge in dashboard header
- Toast notification when new lead arrives:
  - "New inquiry from Microsoft - 120 guests, March 15"
  - [View Lead] [Dismiss]
- Notification center:
  - List of recent notifications
  - Mark as read/unread
  - Clear all

**Email Notifications:**
- Toggle: "Email me when new leads arrive"
- Frequency options:
  - Immediate (per lead)
  - Digest (hourly/daily summary)
  - Off
- Priority filter:
  - All leads
  - High-priority leads only
- Email template (customizable):
  - Subject line
  - Body content
  - Include conversation transcript: Yes/No

**SMS Notifications (Optional):**
- Toggle: "Text me for high-priority leads"
- Phone number (verified)
- Only for leads with priority score >80

**Lead Detail Page:**

**Accessed from:** Dashboard → Leads → [Click lead]

**Lead Information Display:**
- Contact card (name, email, phone, company)
- Event details card (type, date, guests, budget)
- Priority score (visual indicator: 🔥 High / ⚡ Medium / 🟢 Low)
- Lead source: "Website - AI Chat"
- Created date/time
- Assigned to (dropdown to change)

**AI Conversation Transcript:**
- Collapsible section: "View Full Conversation"
- Shows full chat history between prospect and AI
- Timestamps per message
- Highlighted: extracted data (event type, date, guest count)

**AI Insights Panel:**
- "What the AI Learned"
  - Event type: Corporate retreat (confidence: 92%)
  - Guest count: 120 (confirmed)
  - Date: March 15, 2026 (flexible)
  - Budget: $10-12K estimated
  - Requirements: Catering, AV, banquet setup
- "Recommended Next Steps"
  - 1. Send Corporate Premium package proposal
  - 2. Offer site tour this week
  - 3. Mention past similar events (Microsoft, Salesforce)
- "Similar Past Events"
  - Shows 2-3 past events with similar parameters
  - Links to those event records

**Quick Actions:**
- [Send Proposal] button → opens proposal generator pre-filled
- [Schedule Tour] button → opens calendar booking
- [Send Email] button → opens email composer with template
- [Mark as Won/Lost] → updates lead status
- [Add Notes] → internal notes field

**Activity Timeline:**
- Shows all actions taken on this lead:
  - Feb 10, 2:30 PM: Lead created from AI chat
  - Feb 10, 2:31 PM: Confirmation email sent to prospect
  - Feb 10, 2:35 PM: Proposal sent
  - Feb 11, 10:15 AM: Proposal viewed by prospect
  - Feb 12, 3:00 PM: Follow-up call scheduled
- Add manual activity (call, meeting, note)

**Lead Status Management:**
- Status dropdown:
  - New
  - Contacted
  - Qualified
  - Proposal Sent
  - Negotiating
  - Won (converts to booking)
  - Lost
- If "Lost" → require reason:
  - Price too high
  - Dates not available
  - Chose competitor
  - Event cancelled
  - Other (text field)

**Follow-Up Automation:**
- Toggle: "Auto-schedule follow-ups"
- Rules:
  - If no response in 24 hours → Send follow-up email
  - If no response in 3 days → Schedule reminder task
  - If proposal viewed but no response in 2 days → Send nudge email

**Acceptance Criteria:**
- ✅ Notifications appear within 30 seconds of lead creation
- ✅ Email/SMS notifications send reliably
- ✅ Full conversation transcript displays correctly
- ✅ AI insights are accurate based on conversation
- ✅ Quick actions work without leaving lead page
- ✅ Activity timeline updates in real-time
- ✅ Status changes sync across dashboard

---

### 3.5 Mobile Responsiveness

**Requirements:**

**Mobile-Optimized Views:**

**Public Page (Mobile):**
- Hero section fills viewport height
- Images optimized for mobile (smaller file sizes)
- Text remains readable (min font size: 16px)
- Buttons are finger-sized (min 44x44px tap targets)
- Gallery uses swipe gestures
- Calendar is scrollable horizontally if needed
- AI chat opens in full-screen modal on mobile
- Contact buttons (call, email) use native mobile actions
  - Phone number → opens phone dialer
  - Email → opens email app

**Editor Dashboard (Mobile/Tablet):**
- Responsive layout for tablet/iPad use
- Live preview switches to stacked layout (not side-by-side)
- Photo upload uses mobile camera if available
- Form fields stack vertically
- Drag-and-drop works with touch gestures

**Touch Interactions:**
- Swipe gestures for gallery navigation
- Pinch-to-zoom on floor plans/photos
- Pull-to-refresh on analytics page
- Long-press for contextual menus

**Performance:**
- Mobile page load time < 3 seconds (on 4G)
- Images use lazy loading
- Critical CSS inlined for above-the-fold content
- No layout shift during page load

**Acceptance Criteria:**
- ✅ All interactive elements work on touch devices
- ✅ No horizontal scrolling on any mobile screen
- ✅ Text is readable without zooming
- ✅ Forms can be filled out on mobile without frustration
- ✅ AI chat keyboard doesn't obscure input field
- ✅ Page passes Google Mobile-Friendly Test

---

### 3.6 SEO & Discoverability

**Requirements:**

**On-Page SEO:**
- Proper HTML structure:
  - H1 tag: Venue name
  - H2 tags: Section headings
  - Semantic HTML (header, nav, main, section, footer)
- Meta tags:
  - Title (60 chars max, includes city/state)
  - Description (160 chars max, includes USP)
  - Keywords (relevant event/venue keywords)
- Open Graph tags (for social sharing):
  - og:title, og:description, og:image, og:url, og:type
- Schema.org markup:
  - Type: EventVenue
  - Properties: name, address, geo, telephone, maximumAttendeeCapacity, amenityFeature

**Technical SEO:**
- Clean URL structure (no query parameters)
- Fast load times (<2 seconds)
- Mobile-friendly (responsive design)
- HTTPS (secure)
- XML sitemap includes all venue pages
- Robots.txt properly configured

**Content SEO:**
- Keyword-rich content (natural, not stuffed):
  - Venue name + city/neighborhood
  - Event types (e.g., "corporate event venue Dallas")
  - Capacity keywords (e.g., "500-person venue")
  - Amenities keywords (e.g., "AV equipment included")
- Alt text on all images (descriptive, keyword-relevant)
- Internal linking (if venue directory exists)

**Local SEO:**
- Google Business Profile integration (future)
- NAP consistency (Name, Address, Phone across web)
- Local schema markup (LocalBusiness type)
- Embedded Google Map

**Search Console Integration:**
- Venue manager can connect Google Search Console
- View search performance in dashboard:
  - Impressions, clicks, CTR, avg position
  - Top search queries
  - Top pages

**Acceptance Criteria:**
- ✅ Page title and meta description properly set
- ✅ All images have meaningful alt text
- ✅ Schema markup validates (Google Structured Data Testing Tool)
- ✅ Page loads in <2 seconds on fast connection
- ✅ Page is indexed by Google within 48 hours of publishing
- ✅ Social sharing shows correct image/title/description

---

## Technical Architecture

### Tech Stack Recommendations

**Frontend (Public Page):**
- Framework: Next.js 14+ (React) or Nuxt 3 (Vue)
  - Reasoning: SSR for SEO, fast performance, image optimization
- Styling: Tailwind CSS
- UI Components: shadcn/ui or Headless UI
- Image optimization: Next.js Image component or Cloudinary
- Chat UI: Custom component with react-chat-widget or similar

**Backend (API):**
- Framework: Node.js (Express/Fastify) or Python (FastAPI)
- Database: PostgreSQL (relational data: venues, leads, events)
- Caching: Redis (availability calendar, session data)
- File storage: AWS S3 or Cloudflare R2 (images/PDFs)
- CDN: Cloudflare or AWS CloudFront

**AI Integration:**
- LLM API: Anthropic Claude API or OpenAI GPT-4
- Vector DB (optional, for semantic search): Pinecone or Weaviate
- Prompt management: LangChain or custom

**Real-Time:**
- WebSockets: Socket.io or Pusher
- For chat messages and live notifications

**Analytics:**
- Self-hosted: Plausible or PostHog
- Or: Google Analytics 4

**Email:**
- Transactional: Resend, SendGrid, or AWS SES
- Templates: MJML or React Email

**PDF Generation:**
- Puppeteer (headless Chrome) or Gotenberg
- Or: Template-based with PDFKit

**Authentication:**
- Venue manager login: NextAuth.js or Clerk
- Public page: No auth required

### Database Schema (Key Tables)

**venues:**
```sql
- id (uuid, PK)
- name (text)
- slug (text, unique)
- location (jsonb: {address, city, state, zip, lat, lng})
- tagline (text)
- description (text)
- hero_image_url (text)
- page_status (enum: draft, published, unpublished)
- created_at, updated_at
- owner_id (uuid, FK to users)
```

**venue_photos:**
```sql
- id (uuid, PK)
- venue_id (uuid, FK)
- section_name (text: "Main Venue", "Gallery", etc.)
- image_url (text)
- caption (text)
- display_order (integer)
- created_at
```

**venue_spaces:**
```sql
- id (uuid, PK)
- venue_id (uuid, FK)
- name (text: "Grand Ballroom")
- type (enum: ballroom, boardroom, outdoor, etc.)
- capacity_seated (integer)
- capacity_standing (integer)
- capacity_theater (integer)
- description (text)
- photo_url (text)
- display_order (integer)
```

**venue_packages:**
```sql
- id (uuid, PK)
- venue_id (uuid, FK)
- name (text: "Basic", "Premium")
- description (text)
- base_price (decimal)
- pricing_model (enum: flat, per_person, per_hour, tiered)
- inclusions (jsonb: array of what's included)
- is_visible_on_public_page (boolean)
```

**conversations:**
```sql
- id (uuid, PK)
- venue_id (uuid, FK)
- prospect_email (text, nullable initially)
- prospect_name (text, nullable)
- started_at (timestamp)
- last_message_at (timestamp)
- status (enum: active, completed, escalated)
- lead_id (uuid, FK, nullable - set when lead created)
```

**conversation_messages:**
```sql
- id (uuid, PK)
- conversation_id (uuid, FK)
- role (enum: user, assistant)
- content (text)
- extracted_data (jsonb: event details parsed from message)
- created_at (timestamp)
```

**leads:**
```sql
- id (uuid, PK)
- venue_id (uuid, FK)
- source (enum: ai_chat, manual, phone, email, referral)
- contact_name (text)
- contact_email (text)
- contact_phone (text)
- company (text)
- event_type (text)
- event_date (date)
- guest_count (integer)
- estimated_budget (decimal)
- requirements (jsonb: array)
- status (enum: new, contacted, qualified, proposal_sent, won, lost)
- priority_score (integer: 0-100)
- assigned_to (uuid, FK to users)
- conversation_id (uuid, FK, nullable)
- created_at, updated_at
```

### API Endpoints

**Public Endpoints (No Auth):**
```
GET /api/venues/:slug - Get venue public page data
GET /api/venues/:slug/availability?month=2026-03 - Get calendar availability
POST /api/venues/:slug/chat - Send chat message, get AI response
POST /api/venues/:slug/inquiries - Submit inquiry (fallback if chat disabled)
```

**Private Endpoints (Venue Manager Auth):**
```
GET /api/venues/:id - Get venue details (for editing)
PUT /api/venues/:id - Update venue details
POST /api/venues/:id/photos - Upload photo
DELETE /api/venues/:id/photos/:photoId - Delete photo
PUT /api/venues/:id/photos/reorder - Reorder photos

GET /api/venues/:id/packages - Get packages
POST /api/venues/:id/packages - Create package
PUT /api/venues/:id/packages/:packageId - Update package
DELETE /api/venues/:id/packages/:packageId - Delete package

GET /api/venues/:id/leads - Get leads for venue
GET /api/leads/:id - Get lead detail
PUT /api/leads/:id - Update lead status/notes
POST /api/leads/:id/proposal - Generate and send proposal

GET /api/venues/:id/analytics - Get page analytics
GET /api/conversations/:id - Get conversation transcript
```

---

## User Stories

### For Venue Managers

**Story 1: Setting Up Public Page**
> As a venue manager, I want to create a professional public page for my venue, so that prospects can learn about my space and book events without calling me.

**Acceptance Criteria:**
- Can upload hero image and gallery photos
- Can add venue details (spaces, capacity, amenities)
- Can set pricing packages
- Can publish page and get shareable URL
- Page looks professional on mobile and desktop

**Story 2: Managing Inquiries**
> As a venue manager, I want to receive and respond to inquiries from my public page, so that I can convert prospects into bookings efficiently.

**Acceptance Criteria:**
- Notified immediately when new inquiry arrives (email/SMS)
- Can view full conversation between prospect and AI
- Can see AI's recommended next steps
- Can send proposal or schedule tour with one click
- Can track inquiry status (new → won/lost)

**Story 3: Customizing AI Behavior**
> As a venue manager, I want to control how the AI assistant interacts with prospects, so that it reflects my venue's brand and communication style.

**Acceptance Criteria:**
- Can choose AI tone (professional, friendly, etc.)
- Can set pricing display rules (show exact prices or ranges)
- Can configure when AI escalates to human
- Can customize greeting message
- Changes take effect immediately

**Story 4: Viewing Performance**
> As a venue manager, I want to see how my public page is performing, so that I can optimize it for more bookings.

**Acceptance Criteria:**
- Can see page views and inquiry counts
- Can see conversion rate (views → inquiries → bookings)
- Can see where visitors come from (Google, social, etc.)
- Can see which sections of page get most engagement
- Can export analytics report

---

### For Prospects/Event Planners

**Story 5: Discovering Venue**
> As an event planner, I want to quickly learn if a venue can accommodate my event, so that I don't waste time on venues that won't work.

**Acceptance Criteria:**
- Can see venue photos and capacity info immediately
- Can check if my date is available
- Can see what amenities are included
- Can view pricing ranges or packages
- Page loads fast on mobile

**Story 6: Getting Instant Answers**
> As an event planner, I want to get answers to my questions without calling or emailing, so that I can move quickly in my planning process.

**Acceptance Criteria:**
- Can describe my event in natural language
- AI understands my requirements (date, guest count, setup)
- AI checks availability and provides pricing estimate
- AI suggests alternatives if my date is unavailable
- Can get proposal sent to my email in minutes

**Story 7: Comparing Options**
> As an event planner, I want to see venue details and pricing clearly, so that I can compare multiple venues and make a decision.

**Acceptance Criteria:**
- Can see all included amenities and services
- Can see pricing breakdown (venue + catering + extras)
- Can see photos of different setup styles
- Can save or download proposal for comparison
- Can contact venue manager directly if needed

---

## Success Metrics

### Product Success (3 Months Post-Launch)

**Adoption:**
- 80%+ of venues create a public page
- 60%+ of venues publish their page (not just draft)
- 40%+ of venues actively use and update their page monthly

**Engagement:**
- Average 50+ page views per venue per month
- 20%+ of page views result in inquiry (chat opened)
- 40%+ of inquiries result in lead capture (contact info collected)

**AI Performance:**
- 85%+ accuracy in extracting event details from conversations
- <5% of conversations escalate to human due to AI failure
- 3+ messages average per conversation (indicates engagement)
- 60%+ of prospects provide contact info during chat

**Conversion:**
- 15%+ conversion rate: inquiry → proposal sent
- 25%+ conversion rate: proposal sent → booking confirmed
- Overall funnel: 3-5% page view → booking (industry benchmark: 1-2%)

**Satisfaction:**
- Venue manager NPS: 40+ (promoters - detractors)
- Prospect satisfaction: 4.2+ stars average (post-booking survey)
- <10% of venues disable AI chat (indicates trust in feature)

---

### Business Impact (6 Months)

**For SamisenAI:**
- Increase in average contract value (venues pay more for premium tier with AI chat)
- Reduction in churn (venues with public pages have higher retention)
- NPS increase from public page users vs non-users
- Upsell opportunities (venues want custom domains, premium features)

**For Venues:**
- 30%+ reduction in time spent responding to inquiries
- 20%+ increase in qualified leads (AI pre-qualifies)
- 50%+ faster response time (instant AI responses vs hours/days)
- 15%+ increase in booking conversion rate (faster, more professional process)

---

## Risks & Mitigation

### Risk 1: AI Gives Inaccurate Information

**Impact:** High - Venues lose trust, prospects get wrong pricing/availability

**Mitigation:**
- AI pulls data from live calendar (zero chance of outdated availability)
- AI gives "estimated" pricing, never commits to exact prices
- Venue manager can review proposals before auto-sending (optional setting)
- Log all AI responses for auditing
- "Report an issue" button for prospects to flag bad responses

### Risk 2: Venues Don't Set Up Pages (Low Adoption)

**Impact:** High - Feature fails if not used

**Mitigation:**
- White-glove onboarding for first 50 venues
- Pre-fill page with data from existing venue records
- "Setup checklist" gamification (progress bar)
- Show success metrics from early adopters
- Make basic page setup take <10 minutes

### Risk 3: AI Chat Costs Too High (API Costs)

**Impact:** Medium - Eats into margins if chat volume is huge

**Mitigation:**
- Tier pricing: Basic tier has limited AI features or message caps
- Efficient prompting (shorter prompts = lower cost)
- Cache common responses (FAQ-style answers)
- Monitor cost per venue, flag outliers
- Charge premium for unlimited AI chat

### Risk 4: Public Pages Hurt SEO (Duplicate Content)

**Impact:** Low-Medium - VenueManager pages compete with venues' own sites

**Mitigation:**
- Encourage venues to use VenueManager as their primary booking page
- Offer custom domain feature (events.venuename.com)
- Canonical tags if venues have other sites
- VenueManager pages have unique content (AI chat, real-time availability)

### Risk 5: Prospects Abuse AI Chat (Spam, Trolls)

**Impact:** Low - Wastes resources, creates noise for venue managers

**Mitigation:**
- Rate limiting (max X messages per IP per day)
- CAPTCHA after 3 messages (optional)
- AI detects spam/trolling and ends conversation
- Venue manager can block IPs or emails
- Review flagged conversations for patterns

---

## Launch Plan

### Phase 1: Private Beta (Week 1-4)

**Week 1-2: Build MVP**
- Public page MVP (hero, gallery, details, contact)
- Basic inquiry form (no AI yet)
- Page editor dashboard

**Week 3: AI Chat Integration**
- AI conversation engine
- Lead capture from chat
- Notifications to venue managers

**Week 4: Beta Testing**
- Invite 10 friendly venues to test
- Collect feedback, fix bugs
- Iterate on AI prompt engineering
- Optimize page load performance

**Goal:** 10 venues with published pages, 50+ inquiries processed

---

### Phase 2: Limited Launch (Week 5-8)

**Week 5-6: Onboarding Expansion**
- Invite 50 more venues (existing customers)
- Create video tutorials
- Live onboarding calls (optional)
- Build FAQ/help docs

**Week 7-8: Feature Polish**
- Add testimonials feature
- Add SEO settings
- Improve AI chat UI
- Analytics dashboard v1

**Goal:** 50 venues with published pages, 500+ inquiries, gather testimonials

---

### Phase 3: General Availability (Week 9+)

**Week 9: Full Launch**
- Public announcement (email, social, blog post)
- Press release (if applicable)
- Feature in demo videos and sales materials
- All new customers get access by default

**Week 10-12: Optimization**
- A/B test page layouts
- Improve AI accuracy based on data
- Add requested features
- Scale infrastructure

**Goal:** 80%+ of customers using public pages, <2% churn related to feature

---

## Open Questions

**Question 1:** Should we allow venues to accept online payments directly on public page?
- Pros: Frictionless booking, higher conversion
- Cons: Requires payment processing integration (Stripe), liability, complexity
- Recommendation: Phase 2 feature

**Question 2:** Should we build a venue directory/marketplace?
- E.g., venuemanager.pro/venues (browse all venues by city)
- Pros: Drives traffic, helps smaller venues get discovered
- Cons: Creates competition between our customers
- Recommendation: Phase 3, opt-in only

**Question 3:** How much control should AI have?
- Option A: AI can send proposals automatically (high automation)
- Option B: AI creates draft, venue manager approves (more control)
- Recommendation: Make it configurable per venue

**Question 4:** Should prospects be able to book directly without human interaction?
- Pros: Ultimate convenience, 24/7 booking
- Cons: Venues lose control, can't upsell, pricing complexity
- Recommendation: "Request to Book" only, not instant booking (for now)

**Question 5:** How do we handle venues with multiple locations?
- Option A: Each location gets separate page
- Option B: One parent page with location selector
- Recommendation: Option A for MVP, Option B for enterprise tier

---

## Appendix

### Competitive Analysis

**Competitor 1: Social Tables / Gather**
- Has venue marketplace, but no AI chat
- Public pages are basic, not customizable
- Expensive ($5-10K/year)

**Competitor 2: Tripleseat**
- Strong CRM and event management
- Public pages are dated, no modern features
- No AI capabilities

**Competitor 3: Planning Pod**
- All-in-one tool, but complex
- Public booking forms, but not conversational
- DIY setup (no hand-holding)

**Our Advantage:**
- AI-powered conversational booking (unique)
- Beautiful, modern public pages (better design)
- Easier setup, faster time-to-value
- Mid-market pricing ($299-799 vs $5K+)

---

### Customer Quotes (Validation)

*"I spend 10-15 hours a week just responding to inquiry emails asking the same questions over and over. An AI assistant would save me so much time."*  
— Sarah, Event Manager, Dallas Convention Center

*"Our website is outdated and we don't have budget to rebuild it. A professional booking page would be huge for us."*  
— Mike, Owner, Skyline Rooftop Venue

*"I lose bookings because I don't respond fast enough. If prospects could get instant answers 24/7, that would change everything."*  
— Priya, Director of Sales, Grand Hotel Events

---

### Resources & References

**Design Inspiration:**
- Airbnb (for hero sections, photo galleries)
- Notion (for clean editor UI)
- Linear (for dashboard aesthetics)
- Intercom (for chat UI patterns)

**AI Chat Examples:**
- Intercom's Fin AI
- Drift's conversational marketing
- Ada's customer support bot

**Technical References:**
- OpenAI Chat Completions API docs
- Anthropic Claude API docs
- Next.js Image Optimization guide
- PostgreSQL JSONB best practices

---

## Conclusion

This PRD defines a comprehensive public venue page system with AI-powered conversational booking. The core value proposition is giving venues a **24/7 AI booking assistant** that qualifies leads, answers questions, and captures inquiries automatically—while giving venue managers full control over their public page content, pricing, and AI behavior.

**Key Success Factors:**
1. Beautiful, fast-loading public pages (first impression matters)
2. Accurate, helpful AI conversations (must actually work well)
3. Easy page setup for venue managers (10-minute setup, not 2 hours)
4. Clear ROI for venues (fewer hours spent, more bookings converted)

**Next Steps:**
1. Technical architecture review → Finalize tech stack
2. Design mockups → Create high-fidelity designs for key screens
3. Development sprint planning → Break into 2-week sprints
4. Beta customer recruitment → Find 10 venues for private beta

**Timeline to MVP:** 4-5 weeks  
**Timeline to General Availability:** 8-10 weeks

---

**Document Status:** ✅ Ready for Review  
**Last Updated:** February 10, 2026  
**Version:** 1.0