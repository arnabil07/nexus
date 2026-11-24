"use client";

import { useSyncExternalStore } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase/client";
import type { BookmarkType } from "@/types";

/**
 * THE LIBRARY STORE: bookmarks + learning progress.
 *
 *  • Signed out (or Supabase not configured): saved in this browser (localStorage).
 *  • Signed in: saved to Supabase tables `bookmarks` and `user_learning_progress`,
 *    protected by Row Level Security. Anything saved locally before signing in
 *    is merged into the account automatically.
 *
 * It's a tiny "external store" read with React's useSyncExternalStore, so any
 * component can call useLibrary() without prop drilling.
 */

export interface LibraryUser {
  id: string;
  email: string | null;
}

export interface LibraryState {
  ready: boolean;
  accountsEnabled: boolean;
  user: LibraryUser | null;
  /** Keys like "resource:doc-mdn". */
  bookmarks: ReadonlySet<string>;
  /** Keys like "frontend-developer:react". */
  progress: ReadonlySet<string>;
  error: string | null;
}

const STORAGE_KEY = "nexus.library.v1";

const serverSnapshot: LibraryState = {
  ready: false,
  accountsEnabled: false,
  user: null,
  bookmarks: new Set(),
  progress: new Set(),
  error: null,
};

let state: LibraryState = serverSnapshot;
const listeners = new Set<() => void>();
let initialised = false;

function setState(partial: Partial<LibraryState>) {
  state = { ...state, ...partial };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const bookmarkKey = (type: BookmarkType, id: string) => `${type}:${id}`;
export const progressKey = (pathSlug: string, stageId: string) => `${pathSlug}:${stageId}`;

/* ── Local storage ─────────────────────────────────────── */

function readLocal(): { bookmarks: string[]; progress: string[] } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { bookmarks: [], progress: [] };
    const parsed = JSON.parse(raw) as { bookmarks?: unknown; progress?: unknown };
    const strings = (value: unknown) => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []);
    return { bookmarks: strings(parsed.bookmarks), progress: strings(parsed.progress) };
  } catch {
    return { bookmarks: [], progress: [] };
  }
}

function writeLocal(bookmarks: ReadonlySet<string>, progress: ReadonlySet<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ bookmarks: [...bookmarks], progress: [...progress] }));
  } catch {
    // Storage can be unavailable (private mode, quota). The UI still works for this visit.
  }
}

function clearLocal() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/* ── Supabase sync ─────────────────────────────────────── */

function splitKey(key: string): [string, string] {
  const index = key.indexOf(":");
  return [key.slice(0, index), key.slice(index + 1)];
}

async function loadFromAccount(supabase: SupabaseClient, user: LibraryUser) {
  // Merge anything saved locally before the user signed in.
  const local = readLocal();
  if (local.bookmarks.length || local.progress.length) {
    const bookmarkRows = local.bookmarks.map((key) => {
      const [item_type, item_id] = splitKey(key);
      return { user_id: user.id, item_type, item_id };
    });
    const progressRows = local.progress.map((key) => {
      const [path_slug, stage_id] = splitKey(key);
      return { user_id: user.id, path_slug, stage_id };
    });
    const [b, p] = await Promise.all([
      bookmarkRows.length
        ? supabase.from("bookmarks").upsert(bookmarkRows, { onConflict: "user_id,item_type,item_id", ignoreDuplicates: true })
        : Promise.resolve({ error: null }),
      progressRows.length
        ? supabase
            .from("user_learning_progress")
            .upsert(progressRows, { onConflict: "user_id,path_slug,stage_id", ignoreDuplicates: true })
        : Promise.resolve({ error: null }),
    ]);
    if (!b.error && !p.error) clearLocal();
  }

  const [bookmarksRes, progressRes] = await Promise.all([
    supabase.from("bookmarks").select("item_type, item_id"),
    supabase.from("user_learning_progress").select("path_slug, stage_id"),
  ]);
  if (bookmarksRes.error || progressRes.error) {
    setState({ ready: true, error: "We couldn't load your saved items. Please refresh to try again." });
    return;
  }
  setState({
    ready: true,
    error: null,
    bookmarks: new Set(
      (bookmarksRes.data as { item_type: string; item_id: string }[]).map((r) => `${r.item_type}:${r.item_id}`),
    ),
    progress: new Set(
      (progressRes.data as { path_slug: string; stage_id: string }[]).map((r) => `${r.path_slug}:${r.stage_id}`),
    ),
  });
}

function loadLocalData() {
  const local = readLocal();
  setState({ ready: true, user: null, bookmarks: new Set(local.bookmarks), progress: new Set(local.progress) });
}

/** Call once on the client (done by <LibraryInit /> in the root layout). */
export function initLibrary() {
  if (initialised || typeof window === "undefined") return;
  initialised = true;

  const supabase = getBrowserSupabase();
  setState({ accountsEnabled: Boolean(supabase) });
  loadLocalData();

  // Keep several open tabs in sync when signed out.
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY && !state.user) loadLocalData();
  });

  if (!supabase) return;

  supabase.auth.onAuthStateChange((_event, session) => {
    const sessionUser = session?.user ?? null;
    if (!sessionUser) {
      if (state.user) loadLocalData();
      return;
    }
    if (state.user?.id === sessionUser.id) return;
    const user = { id: sessionUser.id, email: sessionUser.email ?? null };
    setState({ user, ready: false });
    // Defer Supabase calls outside the auth callback, as recommended by Supabase.
    setTimeout(() => void loadFromAccount(supabase, user), 0);
  });
}

/* ── Mutations ─────────────────────────────────────────── */

async function toggle(
  kind: "bookmarks" | "progress",
  key: string,
  remote: (supabase: SupabaseClient, user: LibraryUser, add: boolean) => PromiseLike<{ error: unknown }>,
) {
  const current = state[kind];
  const add = !current.has(key);
  const next = new Set(current);
  if (add) next.add(key);
  else next.delete(key);
  setState({ [kind]: next, error: null } as Partial<LibraryState>);

  const supabase = getBrowserSupabase();
  if (state.user && supabase) {
    const { error } = await remote(supabase, state.user, add);
    if (error) {
      setState({ [kind]: current, error: "Couldn't save that change. Please try again." } as Partial<LibraryState>);
    }
  } else {
    writeLocal(state.bookmarks, state.progress);
  }
}

export function toggleBookmark(type: BookmarkType, id: string) {
  return toggle("bookmarks", bookmarkKey(type, id), (supabase, user, add) =>
    add
      ? supabase.from("bookmarks").insert({ user_id: user.id, item_type: type, item_id: id })
      : supabase.from("bookmarks").delete().match({ user_id: user.id, item_type: type, item_id: id }),
  );
}

export function toggleStage(pathSlug: string, stageId: string) {
  return toggle("progress", progressKey(pathSlug, stageId), (supabase, user, add) =>
    add
      ? supabase.from("user_learning_progress").insert({ user_id: user.id, path_slug: pathSlug, stage_id: stageId })
      : supabase.from("user_learning_progress").delete().match({ user_id: user.id, path_slug: pathSlug, stage_id: stageId }),
  );
}

export function dismissLibraryError() {
  setState({ error: null });
}

/** React hook: read the current library state anywhere. */
export function useLibrary(): LibraryState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => serverSnapshot,
  );
}
