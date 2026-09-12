import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and images, so the auth session
     * stays fresh on every real page load without re-running on every asset.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon$|icon-192|icon-512|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
