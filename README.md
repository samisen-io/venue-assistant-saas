# Venue Manager SaaS

A Micro-SaaS web application for event venue managers to streamline vendor coordination, budget tracking, and performance management.

## Overview

**Target Users**: Managers of hotels, banquet halls, and conference centers
**Core Value**: Simplify event planning through intelligent vendor matching, real-time budget tracking, and performance analytics

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account ([supabase.com](https://supabase.com))
- Git

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd venue-assistant-saas
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. Set up the database

- Go to your Supabase project SQL Editor
- Run the complete setup script: [setup-database.sql](setup-database.sql)
- This creates all tables, indexes, RLS policies, and triggers

5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
app/
├── (auth)/          # Authentication pages
├── (dashboard)/     # Protected dashboard pages
└── api/            # Backend API routes

components/
├── ui/             # shadcn/ui components
├── events/         # Event-related components
├── vendors/        # Vendor-related components
└── shared/         # Shared utilities

lib/
├── supabase/       # Database clients
├── utils/          # Helper functions
├── algorithms/     # Vendor matching logic
└── types/          # TypeScript definitions
```

## Key Features (MVP)

- **Authentication & Onboarding** - Secure user signup with profile setup
- **Multi-Venue Management** - Manage multiple venue spaces
- **Event Management** - Full CRUD operations for events
- **Vendor Database** - Track vendors with performance metrics
- **Vendor Matching Engine** - Score-based vendor recommendations
- **Budget Tracking** - Real-time variance monitoring
- **Performance Reviews** - Post-event vendor ratings

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Project overview and AI assistant instructions
- **[setup-database.sql](setup-database.sql)** - Database schema setup script

### PRDs

- **[docs/prds/MVP_PRD.md](docs/prds/MVP_PRD.md)** - Core MVP product requirements (Phase 1)
- **[docs/prds/MARKETPLACE_PRD.md](docs/prds/MARKETPLACE_PRD.md)** - Public marketplace & AI conversational booking (Phase 2)

### Implementation Tasks

- **[docs/tasks/multi_venue_tasks.md](docs/tasks/multi_venue_tasks.md)** - Multi-venue support implementation
- **[docs/tasks/PUBLIC_PAGES_TASKS.md](docs/tasks/PUBLIC_PAGES_TASKS.md)** - Public venue pages implementation
- **[docs/tasks/PublicMarketplace_TaskList.md](docs/tasks/PublicMarketplace_TaskList.md)** - Marketplace launch task list
- **[docs/tasks/STRIPE_SUBSCRIPTION_TASKS.md](docs/tasks/STRIPE_SUBSCRIPTION_TASKS.md)** - Stripe subscription implementation

### Guides

- **[docs/guides/DESIGN_SYSTEM.md](docs/guides/DESIGN_SYSTEM.md)** - UI/UX design system and component patterns
- **[docs/guides/SETUP_GUIDE.md](docs/guides/SETUP_GUIDE.md)** - AI agent, webhook, and email infrastructure setup
- **[docs/guides/PRE_LAUNCH_GUIDE.md](docs/guides/PRE_LAUNCH_GUIDE.md)** - Pre-launch and deployment checklist

### Testing

- **[docs/testing/MANUAL_TEST_CHECKLIST.md](docs/testing/MANUAL_TEST_CHECKLIST.md)** - Manual QA regression checklist

## Development Workflow

### Adding a New Feature

1. Check the PRD for specifications
2. Create/update components in `components/`
3. Add API routes in `app/api/`
4. Update database schema if needed (and RLS policies)
5. Follow existing patterns in the codebase

### Database Changes

- Always update RLS policies when modifying tables
- Test multi-tenant isolation (users should only see their data)
- Run migrations in Supabase SQL Editor

### Code Style

- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Keep components focused and reusable
- Extract business logic to `lib/` directory

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for details.

## Database Schema

The application uses a multi-tenant architecture with Row Level Security (RLS):

**Core Tables:**
- `profiles` - User information
- `venues` - Venue details (one per user)
- `spaces` - Physical spaces within venues
- `event_services` - Service catalog per venue
- `vendors` - Vendor database with performance metrics
- `events` - Event management
- `event_vendors` - Vendor assignments
- `vendor_reviews` - Performance ratings

**AI Tables** (Future):
- `agent_runs` - AI agent execution tracking
- `vendor_communications` - Email tracking
- `vendor_quotes` - Quote management

All tables are protected by RLS policies ensuring data isolation between users.

## Contributing

This is a personal/team project. Please follow the existing code patterns and update documentation when adding features.

## License

[Your License Here]

## Support

For issues or questions, refer to the PRD or create an issue in the repository.
