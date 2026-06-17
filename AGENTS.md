<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Phishified — Project Knowledge Base

## Overview
Phishified is a phishing simulation platform built with Next.js 16.2.9, React 19.2.4, and Tailwind CSS v4. It uses the App Router, shadcn/ui (Base UI variant), and Turbopack (default bundler).

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.9 (App Router) |
| UI Library | React 19.2.4 |
| Styling | Tailwind CSS v4, `tw-animate-css` |
| Component Lib | shadcn/ui (Base UI variant: `@base-ui/react@1.5.0`) |
| Icons | lucide-react@1.20.0 |
| Charts | recharts@3.8.1 |
| Cmd+K | cmdk@1.1.1 |
| TypeScript | v5.x (strict) |
| Linter | ESLint v9 (flat config) |

## Key Conventions
- **No comments in code** unless explicitly asked
- **Server Components by default** — only add `"use client"` when interactivity is required (onClick, useState, useEffect, browser APIs)
- **Data layer** lives in `src/data/` — pure TypeScript modules with type definitions and synchronous mock query helpers
- **Imports** use `@/` alias (maps to `src/`)
- **Build command**: `npx next build` (Turbopack default; use `--webpack` to fall back)

## Project Structure

```
src/
├── app/
│   ├── (app)/                          # Authenticated app shell
│   │   ├── layout.tsx                  # App layout: Sidebar + Header + CommandPalette
│   │   ├── loading.tsx                 # Loading spinner for app routes
│   │   ├── dashboard/page.tsx          # Dashboard (KPIs, charts, activity feed)
│   │   ├── campaigns/
│   │   │   ├── page.tsx                # Campaign list
│   │   │   ├── [id]/page.tsx           # Campaign detail (stats, activity)
│   │   │   └── new/page.tsx            # Campaign creation form
│   │   ├── templates/
│   │   │   ├── page.tsx                # Template list
│   │   │   ├── [id]/page.tsx           # Template preview
│   │   │   └── new/page.tsx            # Template editor
│   │   ├── employees/
│   │   │   ├── page.tsx                # Employee list
│   │   │   ├── [id]/page.tsx           # Employee profile (risk, activity)
│   │   │   └── import/page.tsx         # CSV upload + HRIS integration
│   │   ├── landing-pages/
│   │   │   ├── page.tsx                # Landing page list
│   │   │   ├── [id]/page.tsx           # Landing page detail (visitor stats)
│   │   │   └── new/page.tsx            # Landing page creator
│   │   ├── analytics/page.tsx          # Charts, KPIs, department risk
│   │   ├── reports/
│   │   │   ├── page.tsx                # Report list
│   │   │   └── [id]/page.tsx           # Report detail with metrics
│   │   ├── training/
│   │   │   ├── page.tsx                # Course list with progress bars
│   │   │   └── [courseId]/page.tsx     # Course detail with modules
│   │   ├── ai-assistant/page.tsx       # Chat interface
│   │   └── settings/page.tsx           # Settings grid
│   ├── (marketing)/                    # Landing/marketing pages
│   │   ├── layout.tsx                  # Navbar + Footer
│   │   └── page.tsx                    # Hero + Features
│   ├── layout.tsx                      # Root layout (fonts, TooltipProvider)
│   ├── loading.tsx                     # Global loading
│   ├── error.tsx                       # Global error boundary
│   └── not-found.tsx                   # 404 page
├── components/
│   ├── ui/                             # shadcn/ui components
│   │   ├── button.tsx                  # Base UI Button
│   │   ├── tooltip.tsx                 # Base UI Tooltip
│   │   ├── page-header.tsx             # Reusable page title + actions
│   │   ├── search-input.tsx            # Search bar with Search icon
│   │   ├── stat-card.tsx               # KPI card with trend indicator
│   │   └── status-badge.tsx            # Campaign status badge
│   ├── layout/                         # App shell components
│   │   ├── sidebar.tsx                 # Fixed sidebar (collapsible, nav items)
│   │   ├── header.tsx                  # Top bar (breadcrumb, search trigger, theme)
│   │   └── command-palette.tsx         # Cmd+K modal (global search)
│   ├── dashboard/                      # Dashboard widgets
│   │   ├── kpi-card.tsx                # Metric card with icon + trend
│   │   ├── charts.tsx                  # Recharts area + bar charts (Client Component!)
│   │   ├── activity-feed.tsx           # Live activity list
│   │   └── quick-actions.tsx           # Quick action buttons
│   └── marketing/                      # Landing page components
│       ├── navbar.tsx
│       ├── hero.tsx
│       ├── features.tsx
│       └── footer.tsx
├── data/                               # Mock data layer (synchronous)
│   ├── index.ts                        # Re-exports all modules
│   ├── campaigns.ts                    # Campaign type, status config, 12 campaigns, 6 helpers
│   ├── employees.ts                    # Employee type, 20 employees, 5 helpers + getRiskLevel
│   ├── templates.ts                    # Template type, 12 templates, 3 helpers
│   ├── landing-pages.ts               # LandingPage type, 8 pages, 2 helpers
│   ├── analytics.ts                   # Chart data, KPIs, 12-month trends, 8 departments
│   ├── reports.ts                     # Report type, 8 reports, 2 helpers
│   ├── activity.ts                    # Activity type, 10 activities, 2 helpers
│   └── training.ts                    # Course type, 6 courses with modules
├── hooks/
│   └── use-sidebar.ts                  # Sidebar collapse state (persisted)
├── lib/
│   ├── utils.ts                        # cn() helper, etc.
│   └── navigation.ts                   # Nav items, route labels, quick actions config
└── types/                              # Re-exports from data/ for backward compat
    ├── campaign.ts
    ├── template.ts
    ├── employee.ts
    ├── landing-page.ts
    ├── report.ts
    └── ...
```

## Architecture

### Data Flow
```
Server Components (pages) ──import──> data/*.ts (synchronous) ──> renders UI
                                      │
                                      └── Provides: types + mock data + query helpers
```

- All `data/` modules are synchronous — when a real backend is added, helpers become `async` and pages need minimal changes
- `types/` re-exports from `data/` for backward compatibility

### Layout Hierarchy
```
RootLayout (src/app/layout.tsx)
├── MarketingLayout ((marketing)/layout.tsx) → MarketingPage
└── AppLayout ((app)/layout.tsx)
    ├── Sidebar (fixed, collapsible: 240px / 60px)
    ├── Header
    ├── <main>{children}</main> — page content with ml-[240px] offset
    └── CommandPalette (Cmd+K)
```

### Route Groups
- `(app)` — All authenticated app routes. Dashboard at `/dashboard`. Main content has `ml-[sidebar-width]` to avoid fixed sidebar overlap.
- `(marketing)` — Landing page at `/` with navbar + footer.

## Important Gotchas

### `createContext is not a function` in SSR (Recharts)
Recharts and other client-only libraries calling `createContext` will crash during static generation if imported in a Server Component. **Always add `"use client"` to any component importing recharts.** The build error surfaces as:
```
TypeError: (0 , h.createContext) is not a function
```
The fix is adding `"use client"` to the component that imports the client library (e.g., `charts.tsx`).

### Sidebar Overlap
The sidebar uses `position: fixed`. The main content area must have a left margin (`ml-[240px]` or `ml-[60px]`) matching the sidebar width, read from `useSidebar()` state for correct responsiveness.

### Base UI Button Is a Client Component
`@/components/ui/button.tsx` wraps `@base-ui/react/button`. It cannot receive `onClick` from a Server Component — use `<Link>` instead, or wrap in a Client Component.

### Route Conflict
Only one route group can have a `page.tsx` at the same path. Currently `(marketing)/page.tsx` serves `/`. No `(app)/page.tsx` exists to avoid conflict.

### async params (Next.js 16)
All `params` and `searchParams` in page/layout components are Promises and must be awaited:
```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

## Build Info
- **Static pages generated**: 84 (6 static + 78 prerendered via `generateStaticParams`)
- **Build command**: `npx next build`
- **Dev server**: `npx next dev`
- **No backend** — all data is mock data from `src/data/`
- The `.next/dev` directory is used by the dev server (separate from `.next` for production builds)

## Common Tasks

### Adding a new data module
1. Create `src/data/<name>.ts` with types + mock data + query helpers
2. Re-export from `src/data/index.ts`

### Adding a new page
1. Create `src/app/(app)/<route>/page.tsx`
2. For dynamic routes, export `generateStaticParams()` returning the list of params
3. Export `generateMetadata()` for SEO

### Adding a new UI component
- Place in `src/components/ui/` for shared components
- Use Tailwind classes — no CSS modules
- Only add `"use client"` when needed (DOM events, state, browser APIs)
