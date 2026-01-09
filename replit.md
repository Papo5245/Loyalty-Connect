# Loyalize - Hospitality CRM

## Overview

Loyalize is a premium loyalty CRM platform designed for hospitality businesses (restaurants, cafes, etc.). It provides customer relationship management with tiered loyalty programs, activity tracking, analytics dashboards, and reward systems. The application enables businesses to track customer visits, spending, and engagement while managing loyalty tiers (Silver, Gold, Platinum) with associated benefits.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion for UI animations
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Style**: RESTful JSON API with `/api` prefix
- **Validation**: Zod schemas for request/response validation
- **Development**: tsx for TypeScript execution, Vite dev server with HMR

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with `db:push` command

### Project Structure
```
├── client/src/          # React frontend application
│   ├── components/      # Reusable UI components
│   ├── pages/           # Route page components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities, API client, query config
├── server/              # Express backend
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database access layer
│   └── db.ts            # Database connection
├── shared/              # Shared code between client/server
│   └── schema.ts        # Drizzle database schema
```

### Key Design Patterns
- **Storage Pattern**: `IStorage` interface abstracts database operations, implemented by `DatabaseStorage` class
- **API Layer**: Centralized API functions in `client/src/lib/api.ts` with typed responses
- **Schema Sharing**: Database schemas defined once in `shared/schema.ts`, used for both ORM and Zod validation
- **Component Aliases**: Path aliases (`@/`, `@shared/`) for clean imports

### Database Schema
Four main tables:
- `users`: Authentication (id, username, password)
- `customers`: Customer profiles with tier, segment, visits, spend tracking
- `activity`: Visit and reward activity log per customer
- `tiers`: Loyalty tier definitions with thresholds and benefits

## External Dependencies

### Database
- PostgreSQL database (connection via `DATABASE_URL` environment variable)
- `pg` driver with connection pooling

### Third-Party Services
- **Session Storage**: `connect-pg-simple` for PostgreSQL-backed sessions
- **WhatsApp Campaigns**: Visual prototype only. Requires Twilio integration for actual message sending. User dismissed the Twilio connector setup - will need to configure manually when ready.

### Key NPM Packages
- **UI**: Full shadcn/ui component suite with Radix UI primitives
- **Forms**: react-hook-form with @hookform/resolvers
- **Charts**: Recharts for analytics visualizations
- **Dates**: date-fns for date manipulation
- **Validation**: Zod for runtime type checking

### Development Tools
- Replit-specific Vite plugins for development experience
- Custom meta images plugin for OpenGraph tags
- esbuild for production server bundling