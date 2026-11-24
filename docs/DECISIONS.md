# NEXUS — Decision Log

Every important technical or design decision is recorded here, with the reason.
Newest decisions go at the bottom. If a decision changes, add a new entry instead of deleting the old one.

---

## D-001 — Colour palette (2026-11-24)

The written brief's palette is the single source of truth. Hex codes are never used directly in components. They are defined once as design tokens in `app/globals.css`.

| Token | Hex | Use |
|---|---|---|
| background | #111315 | Main page background |
| surface | #1A1D20 | Secondary background (navbar, sections) |
| card | #222629 | Cards |
| border | #353A3E | Borders and dividers |
| foreground | #E5E7E8 | Primary text |
| secondary | #A1A6AA | Secondary text |
| muted | #858B90 | Muted text, metadata |
| accent | #F57C30 | Orange accent |
| accent-hover | #FF914D | Orange hover |

Orange is reserved for active navigation, buttons, important links, small icons, hover indicators and small highlights.

## D-002 — Hero section (2026-11-24)

The hero is text-only with a very subtle grid or texture. No photographs, large illustrations or decorative elements.

## D-003 — Light theme postponed (2026-11-24)

We ship dark-only first. The dark/light toggle and light palette come in a later phase, once the dark theme is polished.
Consequence: `next-themes` is not installed yet, and dark mode is fixed on the `<html>` element.

## D-004 — Architecture (2026-11-24)

Three layers: pages (`app/`) → content layer (`lib/content/`) → data source.
Pages never import from `data/` directly. In Phase 4 only `lib/content/` changes, when the data source moves from local files to Supabase.

## D-005 — Folder structure (2026-11-24)

We use the brief's structure plus three additions: `config/` (site name and nav links), `lib/content/` (data access) and `[slug]` folders for detail pages. There is no `src/` folder.

## D-006 — Tooling (2026-11-24)

- Package manager: npm (simplest while learning).
- Next.js 16 (App Router), React, TypeScript, Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`), shadcn/ui, Lucide icons.
- Fonts: Plus Jakarta Sans (interface) and JetBrains Mono (technical labels), loaded with `next/font`.

## D-007 — Brand assets (2026-11-24)

We use Lucide icons instead of third-party brand logos (OpenAI, YouTube and so on) for consistency and to avoid trademark issues.

## D-008 — Sample content labelling (2026-11-24)

Sample tech updates always show a visible "Sample" label, and never carry invented publication dates presented as real, until real feeds are connected (Phase 6).

## D-009 — Project memory lives in the repo (2026-11-24)

All code, configuration and documentation live in the local project folder and GitHub. We never rely on chat history.
`docs/BRIEF.md` holds the master brief, `docs/DECISIONS.md` holds the decisions and `docs/PROGRESS.md` holds the status.
To resume in any new chat, share these three files.

---

## Full build (2026-11-24)

The brief changed from phase-by-phase mentoring to "complete the project and deliver the source code". No earlier code existed (only these docs), so the project was built from the agreed decisions above.

## D-010 — No shadcn CLI components; same conventions

The build environment had no npm access, so shadcn's CLI couldn't run. Components in `components/ui` follow shadcn conventions (`cn()`, variants, accessible markup) without adding Radix packages. The mobile menu and ⌘K search use the native `<dialog>` element, which gives focus trapping and Esc-to-close for free. You can still add shadcn components later with `npx shadcn@latest add …`.

## D-011 — Next.js 16 `proxy.ts`

Next.js 16 renamed `middleware.ts` to `proxy.ts`. It refreshes the Supabase session and protects `/account`, and only runs on `/account` and `/auth` routes so public pages stay static and fast.

## D-012 — Bookmarks and progress work without an account

They're saved in localStorage when signed out and in Supabase when signed in; local items are merged into the account on sign-in. Bookmark and progress rows store item ids as text (not foreign keys), so they work whether content lives in files or in the database.

## D-013 — Tech updates from public RSS/Atom feeds

There are no API keys to manage. Feeds refresh hourly (ISR), each item keeps its publisher, date and link, and missing dates are shown as missing, never invented. If every feed fails, labelled samples with no dates or links are shown instead.

## D-014 — Content layer can read from Supabase

`NEXUS_CONTENT_SOURCE=supabase` switches every page to database content, with automatic fallback to local files on error. `supabase/seed.sql` is generated from `/data`.

## D-015 — Resource verification

All 26 YouTube links were verified with YouTube's oEmbed service on 2026-11-24 (`verified: true`). Other resources are well-known official or established sources. Run `npm run check:links` to verify them.

## D-016 — Lucide v1

lucide-react 1.x removed brand icons, so the GitHub mark is a small custom SVG. All content icons are mapped in `components/icons.tsx`.
