# Ballast Point Marketplace

Two-sided marketplace connecting customers with architects.

## Quick Start

```bash
npm install    # Install dependencies
npm run dev    # Start dev server at http://localhost:3000
```

**Requirements:** Node.js >= 20.9.0

## Environment Setup

Copy the example environment file and configure the respective environment variables:

```bash
cp .env.example .env
```

**Note:** All environment variables are validated on startup using Zod. The app will fail with a clear error message if any required variables are missing or invalid.

## Scripts

| Command                | Description              |
| ---------------------- | ------------------------ |
| `npm run dev`          | Start development server |
| `npm run build`        | Production build         |
| `npm run start`        | Start production server  |
| `npm run lint`         | Run ESLint               |
| `npm run format`       | Format with Prettier     |
| `npm run format:check` | Check formatting         |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL hosted on Supabase
- **ORM:** Prisma
- **Auth:** Supabase Auth
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **Linting:** ESLint + Prettier
- **Hosting** Vercel

## Project Structure

```
src/
├── actions/           # Server actions (form handling, mutations)
├── app/               # Next.js App Router
│   ├── (auth)/        # Auth route group (login, signup)
│   ├── api/           # API routes
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page
├── components/
│   ├── auth/          # Auth-specific components
│   └── ui/            # Base UI components (shadcn)
├── lib/
│   ├── auth/          # Auth utilities
│   ├── db/            # Database client (Prisma singleton)
│   ├── services/      # Business logic services
│   │   └── auth/      # Auth service abstraction
│   ├── utils/         # Helper functions
│   └── validations/   # Zod schemas
└── middleware.ts      # Next.js middleware

prisma/
└── schema.prisma      # Database schema
```

## Naming Conventions

### Files and Folders

| Type               | Pattern                         | Example                              |
| ------------------ | ------------------------------- | ------------------------------------ |
| Folders            | lowercase/kebab-case            | `auth`, `services`, `validations`    |
| React Components   | PascalCase                      | `LoginForm.tsx`, `Button.tsx`        |
| Page/Layout files  | lowercase (Next.js convention)  | `page.tsx`, `layout.tsx`             |
| Utilities/Services | camelCase                       | `prisma.ts`, `types.ts`              |
| API Routes         | `route.ts` (Next.js convention) | `api/auth/callback/route.ts`         |
| Config files       | kebab-case                      | `next.config.ts`, `prisma.config.ts` |

### Code Naming

| Type                  | Pattern                        | Example                                               |
| --------------------- | ------------------------------ | ----------------------------------------------------- |
| Functions/Variables   | camelCase                      | `login()`, `signUp()`, `createAuthService()`          |
| Components/Interfaces | PascalCase                     | `LoginForm`, `ActionResult`                           |
| Zod Schemas           | camelCase + `Schema` suffix    | `loginSchema`, `signUpSchema`                         |
| Inferred Types        | PascalCase + `FormData` suffix | `LoginFormData`, `SignUpFormData`                     |
| Factory Functions     | `create*` prefix               | `createAuthService()`, `createServerSupabaseClient()` |
| HOCs/Wrappers         | `with*` prefix                 | `withBasicAuth()`                                     |

### Data Flow

```
Client Component → Server Action → Service → Database
   (LoginForm)      (login())    (authService)  (prisma)
```

- **Components**: Handle UI rendering and user interaction
- **Actions**: Orchestrate validation and call services
- **Services**: Abstract external dependencies (Supabase, etc.)
- **Database**: Prisma client for data persistence

## Project Rules

### Code Quality

- Pre-commit hooks run ESLint and Prettier automatically via Husky
- All code must pass linting before commit
- Use TypeScript strictly - avoid `any`
- Prefer `satisfies` over type annotations: `const x = {...} satisfies Type` not `const x: Type = {...}`
- Use `'use client'` directive only when needed (hooks, browser APIs, event handlers)
- Use `'use server'` for Server Actions (form submissions, mutations)

### Architecture

- Wrap external services in abstractions (`lib/services/`) with barrel files (`index.ts`) for easy swapping without changing import paths
- Use Prisma transactions for multi-step DB operations
- Implement idempotency keys for payment/booking operations
- Use Zod for all API input validation
- Use `///` comments in Prisma schema for field documentation

### Security

- Validate session on all API routes
- Validate resource ownership before access
- Verify webhook signatures (Stripe)
- Never commit secrets - use environment variables

### Environment Variables

- All new env variables must be added to `.env.example` and `env.ts` with a comment explaining their purpose
- Env variables should use the exported `env` variable from env.ts and not process.env

### API Patterns

- Authorization at API level (not RLS)
- Return 401 for unauthenticated, 403 for unauthorized, 404 for not found
- Use Zod schemas in `lib/validations/`
