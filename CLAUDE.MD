# CLAUDE.MD - Venue Assistant SaaS

## Project Overview

**Venue Assistant** is a Micro-SaaS web application for event venue managers to streamline vendor coordination, budget tracking, and performance management. Target users are managers of hotels, banquet halls, and conference centers.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Email** (Phase 2): Resend

## Architecture

### Directory Structure

```
app/
├── (auth)/          # Authentication pages (login, signup)
├── (dashboard)/     # Protected dashboard pages
└── api/            # Backend API routes

components/
├── ui/             # shadcn/ui components
├── layout/         # Layout components
├── events/         # Event-related components
├── vendors/        # Vendor-related components
├── budget/         # Budget tracking components
└── shared/         # Shared utilities

lib/
├── supabase/       # Database clients (server & browser)
├── utils/          # Formatting & validation helpers
├── algorithms/     # Vendor matching & budget calculations
└── types/          # TypeScript type definitions

hooks/              # React custom hooks for data fetching
```

### Database Schema

**Core Tables**:
1. `profiles` - User profile information (extends Supabase auth.users)
2. `venues` - Venue details with owner reference
3. `vendors` - Vendor information with performance metrics
4. `events` - Event details with budget tracking
5. `event_vendors` - Many-to-many assignments with costs
6. `vendor_reviews` - Post-event performance ratings

**Security**: All tables use Row Level Security (RLS) policies for multi-tenant data isolation.

### API Routes

RESTful structure:
- `/api/events` - Event CRUD and vendor matching
- `/api/vendors` - Vendor CRUD and reviews
- `/api/venues` - Venue CRUD
- `/api/profile` - User profile management
- `/api/auth` - Authentication callbacks

## Core Features (MVP - Phase 1)

### 1. Authentication & Onboarding
- Email/password authentication via Supabase
- User profile setup
- First-time venue setup wizard

### 2. Multi-Venue Management
- Users can manage multiple venues
- Full CRUD operations
- Track address, capacity, type

### 3. Event Management
- Create, read, update, delete events
- Fields: name, type, date, time, guest count, budget
- Status tracking: planning, confirmed, in_progress, completed
- Dashboard overview of upcoming events

### 4. Vendor Database
- CRUD operations for vendors
- Categories: catering, AV, florals, parking, security, entertainment
- Track contact info and cost structures
- Performance metrics stored per vendor

### 5. Vendor Matching Engine

**Algorithm**: Score-based recommendations (0-100)

Scoring factors:
- **Reliability score** (40% weight) - from past performance reviews
- **Cost fit** (30% weight) - how well vendor's typical cost fits event budget
- **Experience** (20% weight) - number of similar events handled
- **On-time history** (10% weight) - percentage of on-time deliveries

Users can assign primary and backup vendors.

### 6. Budget Tracking
- Real-time variance monitoring
- Per-category budget breakdown
- Variance alerts: under/on track/over budget
- Track quoted vs. actual costs
- Budget summary export

### 7. Vendor Performance Tracking
- Post-event vendor reviews
- Rating system (1-5 stars)
- Track on-time delivery and cost accuracy
- Automatic reliability score calculation
- Performance history view per vendor

## Design System

### Color Palette (Tailwind)
- **Primary**: blue-600
- **Secondary**: slate-600
- **Success**: green-600
- **Warning**: yellow-600
- **Error**: red-600

### Components
Uses shadcn/ui component library for consistent, accessible UI elements.

## Key Workflows

### Core User Journey
1. **Event Creation** → User creates new event with budget
2. **Vendor Matching** → System recommends vendors based on matching algorithm
3. **Vendor Assignment** → User assigns primary/backup vendors
4. **Budget Tracking** → Monitor costs against budget in real-time
5. **Performance Review** → Post-event vendor ratings update reliability scores

### Data Flow
- Frontend components use custom hooks (in `hooks/`) for data fetching
- Hooks call API routes in `app/api/`
- API routes use Supabase clients from `lib/supabase/`
- Business logic (matching, calculations) lives in `lib/algorithms/`

## Environment Variables

Required `.env.local` variables:
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Optional (Phase 2):
```
RESEND_API_KEY=<resend-key>
```

## Development Guidelines

### Code Organization
- **Pages**: Use Next.js App Router conventions in `app/`
- **Components**: Keep feature-specific components in their respective directories
- **Business Logic**: Extract algorithms and calculations to `lib/`
- **Types**: Define TypeScript interfaces in `lib/types/`
- **Hooks**: Create custom hooks for reusable data fetching logic

### Security Best Practices
- All database queries must respect RLS policies
- Use server-side Supabase client for authenticated operations
- Client-side queries automatically filtered by RLS
- Never expose service role key to client

### Database Access Patterns
- Server components: Use `lib/supabase/server.ts`
- Client components: Use `lib/supabase/client.ts`
- API routes: Use server client with service role for admin operations

## Features Out of Scope (Phase 2)

The following are planned for future releases:
- Timeline generation
- Communication hub/email templates
- Advanced reporting and analytics
- Mobile app
- AI-powered vendor matching
- Team collaboration features
- Payment processing integration

## Documentation

**Primary Reference**: `VenueAssistant_MicroSaaS_PRD.md` (1,170 lines)

This comprehensive PRD contains:
- Complete database schema with RLS policies
- Detailed feature specifications
- API route specifications
- UI/UX guidelines
- Development workflow
- Success metrics

## Important Context for AI Assistants

### When Working on This Project:

1. **Always check the PRD first** - The PRD (`VenueAssistant_MicroSaaS_PRD.md`) is the source of truth for requirements and specifications.

2. **Respect the phased approach** - This is MVP/Phase 1. Don't add Phase 2 features unless explicitly requested.

3. **Follow the vendor matching algorithm** - The scoring weights are intentional: reliability (40%), cost fit (30%), experience (20%), on-time history (10%).

4. **Maintain data isolation** - This is multi-tenant. Always ensure RLS policies are working correctly.

5. **Keep it simple** - This is a Micro-SaaS. Avoid over-engineering. Focus on core MVP features.

6. **Use existing patterns** - Follow established patterns in the codebase for consistency.

### Common Tasks:

- **Adding a new page**: Create in appropriate `app/` subdirectory with layout
- **Adding a component**: Place in feature-specific directory under `components/`
- **Creating an API route**: Follow RESTful conventions in `app/api/`
- **Database changes**: Update Supabase schema AND RLS policies
- **Business logic**: Add to `lib/algorithms/` or `lib/utils/`

### Testing Considerations:

- Test multi-tenant isolation (users should only see their data)
- Verify vendor matching algorithm produces expected scores
- Validate budget calculations and variance tracking
- Test authentication flows and redirects
- Ensure RLS policies prevent unauthorized access

## Current Status

This project exists as a complete PRD ready for implementation. When working on features, refer to the PRD for detailed specifications including UI mockups, validation rules, and success criteria.
