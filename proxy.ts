import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next.js 16 "proxy" (previously called middleware).
 * It keeps the Supabase session fresh and protects /account.
 * When Supabase isn't configured it simply lets every request through.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Only run where auth matters, so public pages stay fast and cacheable.
  matcher: ["/account/:path*", "/auth/:path*"],
};
