# NEXUS

**Explore. Learn. Build.**

NEXUS is a free technology knowledge and learning platform. It organises the best free learning material on the internet into **topics**, **learning paths**, **projects**, a searchable **resource library** and live **tech updates**.

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide icons and Supabase.

---

## Quick start (5 minutes)

You need **Node.js 20.9 or newer** ([nodejs.org](https://nodejs.org), choose "LTS").

```bash
cd nexus                 # go into the project folder
npm install              # download the dependencies (creates node_modules and package-lock.json)
cp .env.example .env.local
npm run dev              # start the development server
```

Open **http://localhost:3000**.

The site works fully **without any accounts or keys**:

- Content comes from the files in `/data`.
- Bookmarks and learning progress are saved in your browser.
- Tech updates load live from public RSS feeds (if you're offline, clearly labelled sample items appear instead).

To turn on accounts (sign up, sign in, synced bookmarks and progress), follow **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)**.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server with instant reload at http://localhost:3000 |
| `npm run build` | Production build (run this before deploying to catch errors) |
| `npm run start` | Runs the production build locally |
| `npm run lint` | Checks code quality with ESLint |
| `npm run typecheck` | Checks TypeScript types |
| `npm run check:links` | Checks every external resource and feed link (needs internet) |
| `npm run db:seed-sql` | Regenerates `supabase/seed.sql` from the `/data` files |

## Features

- **Home**: text-focused hero with search, popular topics, categories, learning paths, recent resources, live tech updates, featured projects and an About section.
- **Explore**: 44 topics in 6 categories, with search, category filter and a beginner-friendly filter (all kept in the URL).
- **Topic pages**: introduction, what you'll learn, why it matters, prerequisites, core concepts, roadmap, resources grouped by type (videos, playlists, articles, docs, courses, papers, repositories, tools, books), projects and related topics, plus an "On this page" table of contents.
- **Learning paths**: 13 roadmaps with ordered stages, skills, resources, exercises and projects. You can mark stages complete to track progress.
- **Resource library**: 184 curated resources with search, five filters (type, area, topic, difficulty, cost), sorting and "show more". Cost labels separate *Free*, *Free to audit* (certificate paid), *Free tier* and *Paid*.
- **Tech updates**: live items from 14 reputable RSS/Atom feeds, refreshed hourly, newest first, with source and date always shown. There's a detail page for each item, and a clearly labelled sample fallback.
- **Projects**: 17 project briefs organised by difficulty, with requirements, step-by-step guides and expected outcomes.
- **Search**: a ⌘K / Ctrl+K command menu everywhere, plus a full `/search` page that also covers tech updates.
- **Library**: your saved items and learning progress.
- **Accounts** (with Supabase): register, sign in, sign out, password reset, a profile page, and bookmarks and progress synced to your account, all protected by Row Level Security.
- SEO metadata, `sitemap.xml`, `robots.txt`, favicon, a 404 page, and loading, empty and error states.

## Documentation

| File | Read it when you want to… |
|---|---|
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | understand what every folder and file does |
| [SUPABASE_SETUP.md](SUPABASE_SETUP.md) | turn on accounts and the database |
| [DEPLOYMENT.md](DEPLOYMENT.md) | put the site online with GitHub and Vercel |
| [CONTENT_GUIDE.md](CONTENT_GUIDE.md) | add or edit topics, resources, paths and projects |
| [docs/DECISIONS.md](docs/DECISIONS.md) | see why things were built the way they are |
| [docs/PROGRESS.md](docs/PROGRESS.md) | see what's done and what's next |
| [docs/BRIEF.md](docs/BRIEF.md) | read the original project brief |

## Before you deploy

Edit `config/site.ts` to set your real **contact email** and **GitHub URL**.
