-- ════════════════════════════════════════════════════════════════════
-- NEXUS — initial database schema
-- Run this once in Supabase: SQL Editor → New query → paste → Run.
-- (Or with the Supabase CLI: `supabase db push`.)
--
-- Security model (Row Level Security):
--   • Content tables: anyone can READ published rows. Nobody can write
--     through the API; you edit content in the Supabase dashboard / SQL
--     editor (which uses admin rights) or by re-running supabase/seed.sql.
--   • profiles, bookmarks, user_learning_progress: each signed-in user can
--     only see and change their own rows.
-- ════════════════════════════════════════════════════════════════════

-- ── Profiles ────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 2 and 60),
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Create a profile row automatically when someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  name text := trim(coalesce(new.raw_user_meta_data ->> 'display_name', ''));
begin
  insert into public.profiles (id, display_name)
  values (new.id, case when char_length(name) >= 2 then left(name, 60) else null end);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Topics ──────────────────────────────────────────────────────────
create table if not exists public.topics (
  slug                text primary key check (slug ~ '^[a-z0-9-]+$'),
  title               text not null,
  category            text not null check (category in (
                        'software-development', 'artificial-intelligence', 'cloud-infrastructure',
                        'data', 'security-networking', 'emerging-technologies')),
  icon                text not null default 'code',
  summary             text not null,
  level               text not null check (level in ('beginner', 'intermediate', 'advanced')),
  beginner_friendly   boolean not null default false,
  popular             boolean not null default false,
  introduction        text not null,
  what_you_will_learn text[] not null default '{}',
  applications        text[] not null default '{}',
  prerequisites       text[] not null default '{}',
  core_concepts       jsonb not null default '[]',   -- [{ "title": "", "description": "" }]
  roadmap             jsonb not null default '[]',   -- [{ "title": "", "description": "" }]
  related             text[] not null default '{}',  -- topic slugs
  sort_order          integer not null default 0,
  is_published        boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── Resources ───────────────────────────────────────────────────────
create table if not exists public.resources (
  id           text primary key check (id ~ '^[a-z0-9-]+$'),
  title        text not null,
  description  text not null,
  type         text not null check (type in (
                 'video', 'playlist', 'article', 'documentation', 'course',
                 'paper', 'repository', 'tool', 'book')),
  publisher    text not null,
  url          text not null unique check (url ~ '^https?://'),
  difficulty   text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  cost         text not null check (cost in ('free', 'free-audit', 'freemium', 'paid')),
  cost_note    text,
  language     text not null default 'English',
  citation     text,
  added_at     date not null default current_date,
  verified     boolean not null default false,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Which resources belong to which topics (many-to-many).
create table if not exists public.topic_resources (
  topic_slug  text not null references public.topics (slug) on delete cascade,
  resource_id text not null references public.resources (id) on delete cascade,
  primary key (topic_slug, resource_id)
);
create index if not exists topic_resources_resource_idx on public.topic_resources (resource_id);

-- ── Learning paths ──────────────────────────────────────────────────
create table if not exists public.learning_paths (
  slug         text primary key check (slug ~ '^[a-z0-9-]+$'),
  title        text not null,
  description  text not null,
  icon         text not null default 'route',
  difficulty   text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  duration     text not null,
  outcome      text not null,
  skills       text[] not null default '{}',
  featured     boolean not null default false,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.learning_path_stages (
  path_slug    text not null references public.learning_paths (slug) on delete cascade,
  stage_id     text not null check (stage_id ~ '^[a-z0-9-]+$'),
  position     integer not null,
  title        text not null,
  description  text not null,
  skills       text[] not null default '{}',
  resource_ids text[] not null default '{}',
  exercise     text not null,
  project_slug text,
  primary key (path_slug, stage_id)
);

-- ── Projects ────────────────────────────────────────────────────────
create table if not exists public.projects (
  slug         text primary key check (slug ~ '^[a-z0-9-]+$'),
  title        text not null,
  category     text not null check (category in (
                 'web', 'mobile', 'ai', 'machine-learning', 'data-science',
                 'devops', 'cybersecurity', 'automation')),
  difficulty   text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  duration     text not null,
  description  text not null,
  technologies text[] not null default '{}',
  skills       text[] not null default '{}',
  requirements text[] not null default '{}',
  steps        jsonb not null default '[]',
  outcome      text not null,
  topics       text[] not null default '{}',
  resource_ids text[] not null default '{}',
  github_url   text check (github_url is null or github_url ~ '^https://'),
  featured     boolean not null default false,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ── Tech updates (optional, for real curated items) ─────────────────
-- Feeds are loaded automatically; use this table only for real updates you
-- add yourself. Every row must have a real source, date and URL.
create table if not exists public.tech_updates (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  summary      text not null default '',
  category     text not null check (category in (
                 'artificial-intelligence', 'software-development', 'cybersecurity', 'cloud-computing',
                 'startups', 'programming', 'hardware', 'emerging-technologies')),
  source       text not null,
  published_at timestamptz not null,
  url          text not null unique check (url ~ '^https?://'),
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists tech_updates_published_idx on public.tech_updates (published_at desc);

-- Public read access for content. No insert/update/delete policies exist,
-- so content cannot be changed through the public API.
alter table public.topics               enable row level security;
alter table public.resources            enable row level security;
alter table public.topic_resources      enable row level security;
alter table public.learning_paths       enable row level security;
alter table public.learning_path_stages enable row level security;
alter table public.projects             enable row level security;
alter table public.tech_updates         enable row level security;

create policy "Published topics are public"    on public.topics               for select to anon, authenticated using (is_published);
create policy "Published resources are public" on public.resources            for select to anon, authenticated using (is_published);
create policy "Topic links are public"         on public.topic_resources      for select to anon, authenticated using (true);
create policy "Published paths are public"     on public.learning_paths       for select to anon, authenticated using (is_published);
create policy "Path stages are public"         on public.learning_path_stages for select to anon, authenticated using (true);
create policy "Published projects are public"  on public.projects             for select to anon, authenticated using (is_published);
create policy "Published updates are public"   on public.tech_updates         for select to anon, authenticated using (is_published);

-- ── Bookmarks ───────────────────────────────────────────────────────
-- item_id is text (not a foreign key) so bookmarks work whether content
-- lives in local files or in the database.
create table if not exists public.bookmarks (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item_type  text not null check (item_type in ('topic', 'resource', 'path', 'project')),
  item_id    text not null check (char_length(item_id) between 1 and 200),
  created_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id)
);

alter table public.bookmarks enable row level security;

create policy "Users can read their own bookmarks"
  on public.bookmarks for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can add their own bookmarks"
  on public.bookmarks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can delete their own bookmarks"
  on public.bookmarks for delete to authenticated using ((select auth.uid()) = user_id);

-- ── Learning progress ───────────────────────────────────────────────
create table if not exists public.user_learning_progress (
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  path_slug    text not null check (char_length(path_slug) between 1 and 200),
  stage_id     text not null check (char_length(stage_id) between 1 and 200),
  completed_at timestamptz not null default now(),
  primary key (user_id, path_slug, stage_id)
);

alter table public.user_learning_progress enable row level security;

create policy "Users can read their own progress"
  on public.user_learning_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can add their own progress"
  on public.user_learning_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can delete their own progress"
  on public.user_learning_progress for delete to authenticated using ((select auth.uid()) = user_id);

-- ── Table privileges (RLS above still decides which ROWS are visible) ──
grant select on public.topics, public.resources, public.topic_resources, public.learning_paths,
  public.learning_path_stages, public.projects, public.tech_updates to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, delete on public.bookmarks, public.user_learning_progress to authenticated;
