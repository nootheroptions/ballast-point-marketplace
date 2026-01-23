# Ballast Point Marketplace

Two-sided marketplace connecting customers with architects.

## Quick Start

```bash
npm install    # Install dependencies
npm run dev    # Start dev server at http://localhost.com:3000
```

**Requirements:** Node.js >= 20.9.0

**Note:** To test subdomain features (like the provider portal) and authentication locally, you'll need to set up local DNS. See [Local Development Setup](#local-development-setup) for details.

## Environment Setup

Copy the example environment file and configure the respective environment variables:

```bash
cp .env.example .env
```

**Note:** All environment variables are validated on startup using Zod. The app will fail with a clear error message if any required variables are missing or invalid.

## Supabase Configuration

### Subdomain Authentication Setup

To enable authentication across subdomains (e.g., logging in on `domain.com` and accessing `providers.domain.com` with the same session), you need to configure Supabase Auth to use a shared cookie domain.

**Solution:**
For detailed instructions, see this solution: https://github.com/supabase/supabase/issues/473#issuecomment-2543434925

### Redirect URLs Configuration

For authentication redirects to work properly with subdomains (e.g., after login, signup, or password reset), you must add each subdomain URL to the allowed redirect URLs in your Supabase dashboard.

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
│   ├── providers/      # Provider portal subdomain routes (providers.domain.com)
│   ├── api/           # API routes
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page (main domain)
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
└── middleware.ts      # Next.js middleware (includes subdomain routing)

prisma/
└── schema.prisma      # Database schema
```

## Responsive Design

The app is built mobile-first using Tailwind CSS and shadcn/ui. All components must work across mobile, tablet, and desktop.

### Tailwind Breakpoints

| Prefix | Min Width | Typical Use   |
| ------ | --------- | ------------- |
| (none) | 0px       | Mobile        |
| `sm:`  | 640px     | Large phone   |
| `md:`  | 768px     | Tablet        |
| `lg:`  | 1024px    | Desktop       |
| `xl:`  | 1280px    | Large desktop |

### Mobile-First Approach

Write base styles for mobile, then add breakpoint prefixes for larger screens:

```tsx
// Base = mobile, md: = tablet, lg: = desktop
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-xl md:text-2xl lg:text-3xl">Title</h1>
</div>
```

### Layout Components Structure

```
src/components/
├── layout/
│   ├── AppShell.tsx       # Main responsive wrapper
│   ├── Sidebar.tsx        # Shared sidebar content (used by desktop + mobile)
│   ├── MobileHeader.tsx   # Mobile-only header with hamburger
│   └── MobileNav.tsx      # Mobile sheet navigation
```

### Responsive Design Rules

- **Prefer CSS over JS** for responsive behavior - use Tailwind classes instead of `useMediaQuery` when possible (better performance, no hydration flash)
- **Share component logic** - reuse the same `Sidebar` component in both desktop sidebar and mobile Sheet
- **Avoid hardcoded heights** - use `min-h-screen`, `flex-1`, `h-full` instead of fixed pixel values
- **Use shadcn Sheet** for mobile navigation - handles accessibility and animations
- **Hide/show with Tailwind** - use `hidden lg:flex` pattern instead of conditional rendering when possible

## Subdomain Routing

The app supports multiple subdomains, each mapped to a route folder:

| Subdomain              | Route Folder  | Description     |
| ---------------------- | ------------- | --------------- |
| `domain.com`           | Root (`app/`) | Main website    |
| `providers.domain.com` | `providers/`  | Provider portal |

**Note:** Subdomain routes use regular folders (not route groups with parentheses) because middleware rewrites require actual URL path segments.

### How It Works

1. Middleware extracts the subdomain from the hostname
2. Requests are rewritten to the corresponding route folder (e.g., `/` becomes `/providers/`)
3. Each subdomain folder has its own pages, layouts, and logic

### Local Development Setup

**Why local DNS is needed:** Browsers don't support cookie sharing across `localhost` subdomains (e.g., `localhost:3000` and `providers.localhost:3000`). To test authentication and subdomain features locally, you need to use a custom domain like `.localhost.com`.

#### 1. Configure Local DNS

Edit your `/etc/hosts` file to map a custom domain to localhost:

```bash
sudo nano /etc/hosts
```

Add these lines at the bottom:

```
127.0.0.1    localhost.com
127.0.0.1    providers.localhost.com
```

#### 2. Update Environment Variables

In your `.env` file, set:

```bash
NEXT_PUBLIC_ROOT_APP_DOMAIN=localhost.com
NEXT_PUBLIC_SITE_URL=http://localhost.com:3000
```

#### 3. Access Your App

- **Main domain**: `http://localhost.com:3000`
- **Provider portal**: `http://providers.localhost.com:3000`

Now cookies (including auth sessions) will be shared across all subdomains.

**Note:** You can use any domain name instead of `localhost.com` (e.g., `ballast.local`, `app.test`, etc.). Just make sure to update both `/etc/hosts` and `.env` accordingly. HOWEVER, I believe it needs to have AT LEAST 2 levels, i.e. just "ballast" will not work (not sure why, but the cookie domain won't cover the .ballast subdomains)

### Adding New Subdomains

1. Create a new route folder: `src/app/subdomain-name/`
2. Add the subdomain mapping in `src/lib/utils/subdomain.ts`:
   ```typescript
   export const SUBDOMAIN_ROUTE_MAP = {
     providers: '/providers',
     newsubdomain: '/newsubdomain', // Add new entry
   };
   ```
3. Add the domain in Vercel project settings for production

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

## Server Actions vs API Routes

Next.js provides two patterns for server-side logic: Server Actions and API Routes. Choose the right pattern based on your use case.

### Quick Decision Tree

```
Is this for external consumption (webhooks, mobile app, third-party)?
├─ YES → API Route
└─ NO → Continue...

Is this a GET request that needs HTTP caching?
├─ YES → API Route
└─ NO → Continue...

Do you need custom HTTP headers, status codes, or binary data?
├─ YES → API Route
└─ NO → Continue...

Is this called from your own React components?
├─ YES → Server Action ✅
└─ NO → Probably API Route
```

**Important:** Server Actions are always POST requests. For read operations that need HTTP caching or are called from external clients, use API Routes with GET methods instead.

### Server Action Pattern (Recommended)

Use action wrapper utilities to eliminate boilerplate for authentication, validation, and error handling.

#### Available Wrappers

**`createAuthenticatedAction`** - For actions that require authentication

- Automatically checks user authentication
- Returns 401 if user not logged in
- Injects authenticated user into handler function
- Optionally validates input with Zod schema

**`createAction`** - For public actions (no authentication required)

- No authentication check
- Optionally validates input with Zod schema
- Use for public data fetching, slug checks, etc.

#### Implementation Details

Action wrappers are located in `lib/auth/action-wrapper.ts` and provide:

- Automatic try-catch error handling
- UnauthorizedError detection and conversion
- Zod validation with formatted error messages
- Result normalization to ActionResult format

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
