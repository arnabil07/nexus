# Deployment guide (MacBook + VS Code → GitHub → Vercel)

## 1. Download and open the project

1. Download `nexus.zip` and double-click it to unzip. You get a folder called `nexus`.
2. Move it somewhere sensible, e.g. `Documents/Projects/nexus`.
3. Open **VS Code → File → Open Folder…** and choose the `nexus` folder.
4. Open the built-in terminal: **Terminal → New Terminal** (or <kbd>Ctrl</kbd>+<kbd>`</kbd>). All commands below run there.

## 2. Check Node.js

```bash
node -v
```

You need **v20.9.0 or newer** (v22 or v24 recommended). If the command isn't found, install the LTS version from [nodejs.org](https://nodejs.org), then quit and reopen VS Code.

## 3. Install dependencies

```bash
npm install
```

This downloads every package listed in `package.json` into `node_modules/` and creates **`package-lock.json`**, which records the exact versions. Commit the lockfile so Vercel installs the same versions.

## 4. Run locally

```bash
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Press <kbd>Ctrl</kbd>+<kbd>C</kbd> to stop the server.

Before deploying, check that a production build works:

```bash
npm run typecheck
npm run lint
npm run build
```

Fix anything these report before going further.

## 5. Set up Supabase (optional)

Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md): create the project, add the keys to `.env.local` and run the migration. You can skip this and add accounts later.

## 6. Put the code on GitHub

1. Go to [github.com/new](https://github.com/new). Name the repository `nexus` and choose Public or Private. **Don't** add a README, .gitignore or licence (the project has them).
2. In the VS Code terminal:

```bash
git init
git add .
git commit -m "feat: initial NEXUS platform"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/nexus.git
git push -u origin main
```

`.gitignore` already keeps `node_modules`, `.next` and `.env.local` (your keys) out of Git.

## 7. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New… → Project** and import your `nexus` repository. Vercel detects Next.js automatically; keep the default settings.
3. Open **Environment Variables** and add:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` (or your domain) |
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase (optional) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | from Supabase (optional) |
| `NEXUS_CONTENT_SOURCE` | `local` (or `supabase` after seeding) |

4. Click **Deploy**. After a couple of minutes your site is live.
5. If you use Supabase: add your Vercel URL to **Authentication → URL Configuration** (Site URL and Redirect URLs `https://your-project.vercel.app/**`).

From now on, every `git push` to `main` deploys automatically.

## 8. Connect a custom domain (optional)

1. In Vercel: **Project → Settings → Domains → Add** and enter your domain (e.g. `nexus.sarowarhussain.com`).
2. Vercel shows a DNS record to add, usually a **CNAME** pointing to `cname.vercel-dns.com` for a subdomain. Add it at your domain registrar's DNS settings.
3. Wait for the check to turn green (minutes to a few hours). HTTPS is set up automatically.
4. Update `NEXT_PUBLIC_SITE_URL` in Vercel to the new domain and redeploy.
5. Update the Supabase Site URL and Redirect URLs to the new domain.

## Troubleshooting

- **Build fails on Vercel but works locally**: make sure `package-lock.json` is committed and the environment variables are set.
- **Sign-in emails go to localhost**: the Supabase Site URL is still `http://localhost:3000`.
- **Tech updates show "Sample"**: the server couldn't reach the feeds. Check the Vercel function logs; `NEXUS_DISABLE_FEEDS` must not be `true`.
