# BloxReport - Discord & Roblox Management Platform

## Overview

BloxReport is a professional SaaS platform for Discord and Roblox server management with Bloxlink integration. The platform provides real-time analytics, secure bot management, verification reporting, and API access for Discord server administrators who need to manage Roblox user verification and cross-platform moderation.

The application enables users to:
- Connect Discord servers via OAuth2 authentication
- Perform Roblox user lookups through Bloxlink API integration
- Register and manage Discord bots securely
- Generate scoped API keys for programmatic access
- Monitor verification requests and activity logs
- Customize server settings and webhooks

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript via Vite build system
- **UI Library**: shadcn/ui component library (Radix UI primitives)
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side navigation
- **Real-time Updates**: WebSocket client with auto-reconnect

**Design Philosophy**: 
- Dark-first design inspired by Discord, Linear, and Vercel
- Purple accent color scheme (#6B21A8 primary)
- Typography: Inter for UI, JetBrains Mono for technical identifiers
- Responsive grid layouts with mobile-first approach

**Key Frontend Patterns**:
- Centralized API request handling through queryClient abstraction
- Protected routes with authentication check wrapper
- WebSocket event listeners for real-time dashboard updates
- Toast notifications for user feedback

### Backend Architecture

**Framework**: Express.js on Node.js
- **Runtime**: ESM modules (type: "module")
- **Development**: Hot reload via Vite dev server integration
- **Production**: Bundled with esbuild for deployment

**API Design**:
- RESTful endpoints under `/api` prefix
- Session-based authentication with HTTP-only cookies
- In-memory session storage (development) - production should use persistent store
- Request/response logging middleware for debugging

**Authentication Flow**:
1. Discord OAuth2 integration (client ID + secret from env)
2. OAuth state validation for CSRF protection
3. Session token generation (32-byte random hex)
4. 7-day session expiration
5. Token exchange with Discord API for user profile

**WebSocket Implementation**:
- Upgrade from HTTP server using `ws` library
- Client set management for broadcasting
- Real-time notifications for verification requests, bot registrations, API usage

### Data Storage

**ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon serverless PostgreSQL (@neondatabase/serverless)
- **Connection**: WebSocket-based connection pool
- **Migrations**: Drizzle Kit for schema management (output to `/migrations`)

**Schema Design**:

1. **Users Table**: Discord user profiles and OAuth tokens
   - Primary key: UUID
   - Unique index on `discordId`
   - Stores access/refresh tokens for Discord API calls

2. **Servers Table**: Discord server configurations
   - Foreign key to users (owner)
   - Unique index on `discordServerId`
   - JSON settings field for customization (accent colors, features, webhooks, rate limits)

3. **Bot Registrations Table**: User-hosted bot management
   - Foreign keys to servers and users
   - HMAC secret hash for bot authentication
   - Status tracking (pending/active/inactive)
   - Webhook URL for bot-to-platform communication

4. **Blox Requests Table**: Verification request history
   - Stores Bloxlink API query results
   - Tracks status (pending/success/failed)
   - User and server association for analytics

5. **API Keys Table**: Scoped programmatic access
   - SHA-256 hashed keys
   - JSON scopes array for permission control
   - Server-specific or user-wide access
   - Last used timestamp tracking

**Storage Interface Pattern**:
- Abstracted CRUD operations through IStorage interface
- Centralized data access logic in `server/storage.ts`
- Separation of concerns between routes and data layer

### Authentication & Authorization

**OAuth2 Flow**:
- Discord as sole identity provider
- Redirect URI configured via environment variable
- State parameter for CSRF protection with expiration
- Token exchange server-to-server

**Session Management**:
- Cookie-based sessions (secure in production)
- Token stored in Map (should migrate to Redis/PostgreSQL for production)
- Session validation middleware for protected routes

**Bot Security Model**:
- No Discord user token acceptance (security principle)
- Two bot registration options:
  1. Official bot OAuth2 invite (if platform provides bot)
  2. User bot webhook registration with HMAC verification
- Secret hash storage for bot authentication
- Webhook-based bot-to-platform communication

### External Dependencies

**Discord API**:
- OAuth2 authentication endpoints
- User profile retrieval
- Server (guild) information
- Bot invitation flow

**Bloxlink API**:
- Roblox-Discord verification lookups
- User search by username or Roblox ID
- Group membership verification
- Rate limiting considerations
- API key authentication (from environment)

**Neon PostgreSQL**:
- Serverless PostgreSQL database
- WebSocket-based connections
- Connection string from `DATABASE_URL` environment variable

**Third-Party UI Libraries**:
- Radix UI primitives (dialogs, dropdowns, tooltips, etc.)
- React Icons for Discord logo
- Lucide React for iconography
- Embla Carousel for image carousels

**Development Tools**:
- Replit-specific Vite plugins (cartographer, dev banner, error overlay)
- TypeScript with path aliases (`@/`, `@shared/`, `@assets/`)
- ESLint/Prettier for code quality (implied by stack)

**Build & Deployment**:
- Vite for frontend bundling
- esbuild for backend bundling
- Express serves static files in production
- Environment-based configuration (NODE_ENV)