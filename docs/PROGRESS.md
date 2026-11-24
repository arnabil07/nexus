# NEXUS — Progress Tracker

**Status:** Feature-complete v1.0 delivered (2026-11-24). Next step: install, build and deploy on your Mac.

To resume work in a new chat, share `docs/BRIEF.md`, `docs/DECISIONS.md` and this file.

## Done
- [x] Design system: palette tokens, Plus Jakarta Sans + JetBrains Mono, dark editorial style, subtle hero grid
- [x] Layout: sticky header with orange active indicator, mobile menu, footer, ⌘K search
- [x] Home, Explore, Topic detail (44 topics), Learning paths (13), Resources (184), Tech updates (live RSS), Projects (17), Search, Library
- [x] Bookmarks + learning progress (browser storage, or Supabase when signed in)
- [x] Supabase: schema + RLS migration, seed generator, server/browser clients, proxy
- [x] Auth: register, login, logout, forgot/reset password, email callback, protected account page, profile editing
- [x] SEO: metadata, sitemap.xml, robots.txt, favicon; 404, error and loading states
- [x] Documentation: README, PROJECT_STRUCTURE, SUPABASE_SETUP, DEPLOYMENT, CONTENT_GUIDE

## To do on your machine
- [ ] `npm install` (creates package-lock.json) → `npm run typecheck` → `npm run lint` → `npm run build`
- [ ] `npm run check:links` and fix or remove any broken links
- [ ] Set contact email and GitHub URL in `config/site.ts`
- [ ] Create the Supabase project and run the migration (optional)
- [ ] Push to GitHub and deploy to Vercel

## Ideas for later phases
- Light theme (postponed by decision D-003)
- Admin UI for editing content
- YouTube Data API / GitHub API enrichment (view counts, stars)
- More topics' depth: extra resources per topic, especially papers for non-AI topics
