import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from "./config";

const PUBLIC_PATHS = ["/login", "/signup", "/auth"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * Refreshes the Supabase auth session on every request, keeps signed-out
 * visitors off the app's protected pages, and routes a first-time user to
 * onboarding before anything else. Runs once per request from src/proxy.ts.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  if (!data.user && !isPublicPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (data.user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Once we know a user is onboarded, remember it in a cookie so every later
  // request skips this DB round-trip — it only ever needs to fire again if
  // someone gets a new browser/session without the cookie.
  if (data.user && pathname !== "/onboarding" && !isPublicPath(pathname) && !request.cookies.get("onboarded")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed_at")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile && !profile.onboarding_completed_at) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    response.cookies.set("onboarded", "1", { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }

  return response;
}
