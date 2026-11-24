"use client";

import Link from "next/link";
import { Notice } from "@/components/ui/states";
import { useLibrary } from "@/lib/library/store";

/** Explains where bookmarks and progress are stored, based on sign-in state. */
export function SyncNotice({ className }: { className?: string }) {
  const { user, accountsEnabled, ready } = useLibrary();
  if (!ready) return null;
  return (
    <Notice className={className}>
      {user ? (
        <>Your bookmarks and progress are saved to your account ({user.email}) and sync across devices.</>
      ) : accountsEnabled ? (
        <>
          Your bookmarks and progress are saved in this browser. <Link href="/auth/login">Sign in</Link> or{" "}
          <Link href="/auth/register">create an account</Link> to keep them across devices.
        </>
      ) : (
        <>Your bookmarks and progress are saved in this browser, so they stay on this device.</>
      )}
    </Notice>
  );
}
