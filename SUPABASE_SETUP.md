# Supabase setup

Supabase gives NEXUS a PostgreSQL database and user accounts. **It's optional.** Without it the site still works, and bookmarks are saved in the browser.

Time needed: about 15 minutes.

## 1. Create a project

1. Go to [supabase.com](https://supabase.com) and sign in (GitHub sign-in is easiest).
2. Click **New project**. Name it `nexus`, set a strong database password (save it in a password manager) and choose the region closest to your users.
3. Wait a minute or two while the project is created.

## 2. Copy your keys into `.env.local`

1. In the project, open **Project Settings → API Keys** (on some projects it's **Settings → API**).
2. Copy the **Project URL** and the **publishable key** (starts with `sb_publishable_`). Older projects show an **anon** key instead, which also works.
3. In your project folder, open `.env.local` (create it from `.env.example` if needed) and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
```

> 🔒 **Never** put the `service_role` / secret key in this project. NEXUS doesn't need it. The publishable key is safe in the browser because Row Level Security protects the data.

Restart `npm run dev` after changing `.env.local`.

## 3. Create the database tables (migration)

1. In Supabase, open **SQL Editor → New query**.
2. Open `supabase/migrations/20261124000000_initial_schema.sql` in VS Code, copy everything, paste it into the editor and click **Run**.
3. You should see "Success". Check **Table Editor**: there are 10 tables (`profiles`, `topics`, `resources`, `topic_resources`, `learning_paths`, `learning_path_stages`, `projects`, `tech_updates`, `bookmarks`, `user_learning_progress`).

What the security rules do:

- Anyone can **read** published content, but nobody can change content through the website.
- Each signed-in user can only see and change **their own** profile, bookmarks and progress.

## 4. Configure authentication URLs

In **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` for now (change it to your real domain after deploying).
- **Redirect URLs**: add `http://localhost:3000/**` and, later, `https://your-domain.com/**` and your Vercel URL `https://your-project.vercel.app/**`.

These URLs tell Supabase where confirmation and password-reset emails may send users.

## 5. Try it

1. Open http://localhost:3000/auth/register and create an account.
2. Click the link in the confirmation email. You land on `/account`.
3. Bookmark something. It's now saved in the `bookmarks` table (see **Table Editor**). Anything you saved before signing in is moved into your account automatically.

**Emails not arriving?** Supabase's built-in email service only sends a few emails per hour and is meant for testing. For a real launch, set up custom SMTP under **Authentication → Emails → SMTP Settings** (for example Resend, Postmark or Amazon SES). During development you can also turn off **Confirm email** under **Authentication → Sign In / Providers → Email**.

**Confirmation link opened in a different browser?** By default the link only works in the browser where you signed up. To make links work anywhere, edit the templates under **Authentication → Emails**:

- Confirm signup: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/account`
- Reset password: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/auth/reset-password`

`app/auth/callback/route.ts` supports both formats.

## 6. (Optional) Serve content from the database

By default content comes from the `/data` files. To serve it from Supabase instead (so you can edit content in the dashboard):

```bash
npm run db:seed-sql     # regenerates supabase/seed.sql from /data
```

1. Paste `supabase/seed.sql` into the SQL Editor and click **Run**. It's safe to run again; existing rows are updated.
2. Set `NEXUS_CONTENT_SOURCE=supabase` in `.env.local` (and in Vercel) and restart.

If the database is ever unreachable, NEXUS automatically falls back to the local files.

You can also add **real** tech updates to the `tech_updates` table. Every row needs a real source, publication date and URL. They're merged with the RSS feeds.
