# Project structure

```
nexus/
├── app/                      ← PAGES. Each folder is a URL (Next.js App Router).
│   ├── layout.tsx            Shell for every page: fonts, header, footer, ⌘K search
│   ├── page.tsx              Homepage  (/)
│   ├── globals.css           Design tokens (colours, fonts) + base styles
│   ├── icon.svg              Favicon
│   ├── loading.tsx           Default loading skeleton
│   ├── error.tsx             Shown when a page crashes ("Try again")
│   ├── not-found.tsx         404 page
│   ├── sitemap.ts            → /sitemap.xml
│   ├── robots.ts             → /robots.txt
│   ├── explore/              /explore
│   ├── topics/[slug]/        /topics/machine-learning … ([slug] = any topic)
│   ├── learning-paths/       /learning-paths and /learning-paths/[slug]
│   ├── resources/            /resources
│   ├── updates/              /updates and /updates/[id]
│   ├── projects/             /projects and /projects/[slug]
│   ├── search/               /search?q=…
│   ├── library/              /library (saved items + progress)
│   ├── account/              /account (protected) + actions.ts (save profile)
│   └── auth/                 login, register, forgot-password, reset-password,
│                             callback/route.ts (email links), actions.ts (server actions)
│
├── components/               ← REUSABLE UI
│   ├── ui/                   Buttons, badges, inputs, empty/error/loading states, filter chips
│   ├── layout/               Container, Section, headers, site header & footer
│   ├── navigation/           Logo, desktop/mobile navigation
│   ├── cards/                Topic, category, path, project, resource and update cards
│   ├── topics/               Explore filter, numbered sections, table of contents
│   ├── paths/  projects/  resources/  updates/   Page-specific browsers & filters
│   ├── search/               ⌘K command menu
│   ├── library/              Bookmark button, library view, sync notice
│   ├── auth/                 Auth forms and layout
│   └── icons.tsx             Every content icon, in one place
│
├── config/
│   ├── site.ts               Site name, tagline, navigation, footer, contact
│   └── feeds.ts              RSS/Atom sources for Tech Updates
│
├── data/                     ← CONTENT (edit these to change what the site shows)
│   ├── categories.ts  topics.ts  resources.ts  learning-paths.ts  projects.ts
│   └── sample-updates.ts     Labelled sample news (only shown if feeds fail)
│
├── lib/
│   ├── content/              THE CONTENT LAYER: pages get data only from here.
│   │   ├── index.ts          getTopics(), getResources(), … (local files or Supabase)
│   │   ├── database.ts       Reads content from Supabase and maps rows to types
│   │   ├── updates.ts        Fetches feeds, merges, sorts, falls back to samples
│   │   └── search-index.ts   Builds the searchable list
│   ├── supabase/             client.ts (browser), server.ts, proxy.ts, public.ts
│   ├── library/store.ts      Bookmarks + progress (localStorage or Supabase)
│   ├── feeds/parse.ts        Small RSS/Atom parser
│   ├── validation/auth.ts    zod form rules
│   ├── search.ts             Search ranking (used by ⌘K and /search)
│   ├── env.ts                Reads environment variables
│   └── utils.ts              cn(), labels, date formatting, safe redirects
│
├── types/index.ts            TypeScript types for all content
├── proxy.ts                  Next.js 16 "proxy" (was middleware): refreshes auth, protects /account
├── supabase/
│   ├── migrations/…sql       Database tables + Row Level Security
│   └── seed.sql              All content as SQL (generated)
├── scripts/                  generate-seed.ts, check-links.ts
└── docs/                     BRIEF.md, DECISIONS.md, PROGRESS.md
```

## How data flows

```
data/*.ts  ─┐
            ├─► lib/content/index.ts ─► app/**/page.tsx ─► components
Supabase  ──┘   (NEXUS_CONTENT_SOURCE decides which source to use)
```

Pages never import `/data` directly. That's why switching to the database is a single environment variable.

## Server vs client components

Files that start with `"use client"` run in the browser: they handle clicks, typing and local state (filters, the search menu, bookmarks). Everything else runs on the server, so it ships no JavaScript and loads fast.
