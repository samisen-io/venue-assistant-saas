# Venue Assistant SaaS — Internal Team Guide

Welcome to the internal documentation for the Venue Assistant SaaS project. This guide provides a high-level overview of our architecture, tech stack, codebase structure, and core workflows. It's designed to help new team members quickly get up to speed and understand how all the moving parts work together.

---

## 🏗 Architecture & Tech Stack

Our platform is a production-ready multi-tenant SaaS application built for venue managers.

**Core Tech Stack:**
*   **Frontend Framework:** Next.js 14+ (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + shadcn/ui components
*   **Backend & Database:** Supabase (PostgreSQL) with Row Level Security (RLS)
*   **Authentication:** Supabase Auth
*   **Deployment:** Vercel

**External Integrations:**
*   **Payments & Subscriptions:** Stripe
*   **Email & Comms:** Resend
*   **AI Integrations:** Anthropic Claude API (powers chat and agent systems)
*   **Background Jobs:** Inngest & Cron Tasks

---

## 📁 Codebase Structure

The application follows a standard Next.js App Router structure with feature-based domain separation:

```text
venue-assistant-saas/
├── app/                  # Next.js App Router root
│   ├── (auth)/           # Authentication routes (login, signup, etc.)
│   ├── (dashboard)/      # Protected manager dashboard routes
│   └── api/              # Backend API routes (~77 routes covering all modules)
├── components/           # React Components
│   ├── ui/               # Reusable shadcn/ui base components
│   └── [feature]/        # Feature-specific components (e.g., events, vendors, venues)
├── lib/                  # Shared utilities and core business logic
│   ├── ai/               # Claude API setup, extractors, and prompts
│   ├── algorithms/       # Vendor matching engine, budget calculations
│   ├── email/            # Resend templates and webhook parsers
│   ├── proposals/        # PDF generation and pricing calculators
│   ├── stripe/           # Stripe config and webhook handlers
│   └── supabase/         # Database clients and schema types
├── docs/                 # Internal documentation and PRDs
└── supabase/             # Supabase migrations, seed data, and schema definitions
```

---

## 🚀 Core Modules Overview

Venue Assistant extends far beyond a simple MVP. It encompasses several robust systems:

### 1. Venue & Space Management
*   **Multi-tenancy:** Managers can own multiple venues (enforced via subscription limits).
*   **Spaces:** Distinct rooms/areas within a venue, supporting capacity limits and availability buffers.
*   **Public Marketplace:** Venues can publish SEO-optimized, customizable public pages.

### 2. Event & Vendor Workflows
*   **Event Handling:** Full CRUD for events, real-time availability checks, double-booking prevention.
*   **Vendor Matching Engine:** An algorithm (`/lib/algorithms/vendorMatching.ts`) that scores vendors based on reliability (30%), cost fit (25%), experience (20%), on-time history (10%), and service overlap (15%).
*   **Budgeting:** Real-time variance tracking (budgeted vs. quoted vs. actual costs).

### 3. CRM, Leads, & Proposals
*   **Leads:** Unified inbox for leads originating from web forms, manual entry, or AI chat. Includes auto-priority scoring.
*   **Proposals:** Dynamic generation of venue proposals with pricing calculators and PDF exports.
*   **Clients:** Directory for managing client communications and booking histories.

### 4. AI & Automation Systems
*   **AI Chat Widget:** Embeddable Claude-powered chat for public pages. Extracts event details naturally, scores lead intent, and auto-generates leads.
*   **AI Agent (Vendor Outreach):** A background agent that automates emailing vendors for quotes and parsing their replies.
*   **Inngest / Cron:** Background workers handle delayed tasks, webhooks, and subscription enforcement.

### 5. Monetization
*   **Stripe Subscriptions:** 4 tiers (Trial, Starter, Professional, Enterprise). Limits for venues, events, vendors, and AI chats are strictly enforced via the backend (`/lib/subscription/limits.ts`).

---

## 🛠 Local Development Workflow

1. **Environment Variables:**
   *   Ensure your `.env.local` is populated with Supabase credentials, Stripe secret keys, Resend API key, and Anthropic API key. Reference `.env.example` if available.

2. **Database Management:**
   *   We use Supabase. Schema changes should be tracked using Supabase CLI migrations located in the `supabase/migrations/` directory.
   *   Row Level Security (RLS) is heavily utilized. Always ensure new tables have appropriate policies so users can only access data linked to their `profile.id` or `venue_id`.

3. **Running the App:**
   ```bash
   npm install
   npm run dev
   ```
   *   The app will run on `localhost:3000`.

4. **Background Jobs (Inngest):**
   *   If testing background tasks locally, you may need to run the Inngest dev server concurrently: `npx inngest-cli@latest dev`.

---

## 🧪 Testing and Deployment

*   **Testing:** We use Playwright for E2E testing. Run tests locally using `npm run test` or `npx playwright test`. Ensure your local Supabase instance is seeded properly before running tests.
*   **Deployment:** The `main` branch is connected to Vercel for automatic deployments. Database migrations should be run against the production Supabase instance cautiously during deployment windows.

---

*This document is meant to evolve. If you build new foundational systems or integrate new external services, please update this guide!*
