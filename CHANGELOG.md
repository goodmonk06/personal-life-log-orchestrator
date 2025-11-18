# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Phase 3 - Deep Expansion (In Progress)

#### Added
- **Domain Model Expansion**
  - Tag system for flexible categorization across entities
  - Template system for reusable content structures
  - Goal tracking with progress and categories
  - Habit tracking with daily/weekly/monthly entries
  - Integration registry for external services
  - AIPrompt for customizable AI generation
  - Enhanced LifeUser with timezone, preferences, metadata
  - Metadata fields added to EventLog and Note

- **Infrastructure**
  - Structured logging system with correlation IDs (`src/lib/logger.ts`)
  - Metrics collection with Prometheus-compatible output (`src/lib/metrics.ts`)
  - Domain events system with type-safe event bus (`src/lib/events.ts`)
  - `/api/metrics` endpoint for Prometheus scraping
  - `/api/health` endpoint for health checks

- **Extensibility**
  - Adapter interfaces for pluggable services
    - `INotificationAdapter`: Email, SMS, push notifications
    - `ICacheAdapter`: Caching layer
    - `IAIAdapter`: AI provider abstraction
    - `IStorageAdapter`: File storage
    - `ISearchAdapter`: Full-text search
    - `IMetricsReporter`: Metrics reporting
  - In-memory cache implementation
  - Console notification adapter (for development)
  - Adapter registry for dependency injection

- **API Endpoints (tRPC)**
  - Tags router: Create, list, update, delete tags
  - Goals router: Goal management with progress tracking
  - Habits router: Habit tracking and entry management

- **Documentation**
  - `docs/PHASE3_OVERVIEW.md`: Project roadmap and objectives
  - `docs/DOMAIN_GUIDE.md`: Comprehensive domain model documentation
  - Enhanced README with Phase 2 improvements

#### Changed
- Prisma schema expanded with 8 new entities and relationships
- tRPC router structure enhanced with new routers
- Error handling improved with centralized middleware

### Phase 2 - Production Ready

#### Added
- **Development Experience**
  - Standardized npm scripts (test, db:seed, docker:*, type-check)
  - Vitest testing framework with initial test suite
  - Docker support (Dockerfile + docker-compose.yml)
  - Comprehensive seed data script
  - Health check endpoint
  - `.env.example` with all configuration options

- **Testing**
  - Unit tests for utility functions (date handling, week calculations)
  - Router tests for Notes CRUD operations
  - `vitest.config.ts` configuration
  - Test coverage setup

- **Error Handling**
  - tRPC error handler middleware
  - Zod validation error formatting
  - Prisma error transformation
  - Consistent error response shapes

- **Documentation**
  - Complete README rewrite with Phase 2 structure
  - `CONTRIBUTING.md` for contribution guidelines
  - `SETUP.md` for detailed setup instructions
  - Docker quickstart guide

#### Changed
- Next.js config updated for standalone output
- package.json scripts standardized across ecosystem
- Prisma schema with proper indexes

### Phase 1 - Initial Implementation

#### Added
- **Core Features**
  - Notes system with date-based journaling
  - EventLog for unified life event storage
  - DailySummary AI generation
  - WeeklyReview AI generation
  - Google Calendar and Gmail import

- **Tech Stack**
  - Next.js 14 with App Router
  - tRPC for end-to-end type safety
  - Prisma ORM with PostgreSQL
  - OpenAI API integration
  - Tailwind CSS for styling

- **Data Models**
  - LifeUser: User management
  - EventLog: Flexible event storage with JSON payloads
  - Note: Daily journaling
  - DailySummary: AI-generated daily reflections
  - WeeklyReview: AI-generated weekly insights

- **UI Pages**
  - `/`: Home page with navigation
  - `/notes`: Note creation and editing
  - `/daily-review`: Daily summary generation
  - `/weekly-review`: Weekly review generation

- **API Layer**
  - tRPC routers for all core entities
  - End-to-end type safety
  - Superjson for complex type serialization

## Version History

### [0.1.0] - 2024-01-XX
- Initial release with core life logging functionality
- Google integrations (Calendar, Gmail)
- AI-powered summaries (daily and weekly)
- Notes system with date-based journaling

---

## Migration Guide

### Upgrading from Phase 2 to Phase 3

**Database Changes:**
```bash
# Phase 3 introduces new tables
npm run db:push  # or db:migrate if using migrations

# Re-seed with enriched data
npm run db:seed
```

**Breaking Changes:**
- None yet - Phase 3 is additive only

**New Environment Variables:**
- No new required variables
- All new features work with existing configuration

**API Changes:**
- New routers added: `tags`, `goals`, `habits`
- Existing routers unchanged (backward compatible)

---

*For detailed upgrade instructions, see the migration guides in `/docs`.*
