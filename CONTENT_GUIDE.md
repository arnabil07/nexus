# Content guide

All content lives in `/data`. Edit a file, save, and the dev server updates instantly. TypeScript checks your entries, so a missing field shows a red underline in VS Code.

## Golden rules

1. **Never invent anything.** No made-up URLs, papers, authors, repositories, news or dates. If you can't verify it, leave it out.
2. **Link to the original publisher.** Never copy articles or videos into NEXUS.
3. **Be honest about cost.** Use:
   - `free`: everything is free.
   - `free-audit`: course content is free, but certificates or graded work cost money.
   - `freemium`: a useful free tier, with some parts paid.
   - `paid`: payment is required.

   Add a `costNote` whenever there's nuance.
4. **Check links** with `npm run check:links` after adding resources. Set `verified: true` only after you've checked a link.
5. **Quality over quantity.** One excellent resource beats ten average ones.

## Add a resource (`data/resources.ts`)

```ts
r({
  id: "doc-svelte",                      // unique, lowercase-with-dashes
  title: "Svelte documentation",
  description: "One sentence on what it is and why it's useful.",
  type: "documentation",                 // video | playlist | article | documentation | course | paper | repository | tool | book
  publisher: "Svelte",
  url: "https://svelte.dev/docs",
  topics: ["frontend-development"],      // topic slugs from data/topics.ts
  difficulty: "intermediate",            // beginner | intermediate | advanced
  cost: "free",
}),
```

For research papers, also add `citation: "Author et al., 2024"`.

## Add a topic (`data/topics.ts`)

Copy an existing `topic({...})` block and change every field. `concepts` and `steps` are `[title, description]` pairs. `related` must list existing topic slugs. The topic automatically gets its own page at `/topics/<slug>`, appears on Explore and in search, and shows every resource whose `topics` includes its slug.

## Add a learning path (`data/learning-paths.ts`)

Each stage uses `stage(id, title, description, skills, resourceIds, exercise, projectSlug?)`. Stage ids must be unique within the path and **shouldn't be renamed later**, because users' saved progress refers to them.

## Add a project (`data/projects.ts`)

Copy a `project({...})` block. Only set `githubUrl` if a real, verified repository exists.

## Tech update feeds (`config/feeds.ts`)

Add `{ id, name, url, category }` for any reputable RSS or Atom feed. Feed items always keep their original title, publisher, date and link. Never edit `data/sample-updates.ts` to look like real news.

## Using the database instead

If you've switched to `NEXUS_CONTENT_SOURCE=supabase`, either edit rows in the Supabase Table Editor, or keep editing `/data` and run `npm run db:seed-sql`, then run `supabase/seed.sql` in the SQL Editor.

## Check your work

```bash
npm run typecheck     # catches missing or misspelled fields
npm run check:links   # catches broken links
npm run build         # catches everything else
```
