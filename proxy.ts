import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "pv_session";

/**
 * Edge-side gate. It only checks that a session cookie exists; the real verification
 * happens server-side in the layouts (the cookie is validated against Firebase there).
 *
 * - /dashboard/* and /account/* require a cookie -> otherwise redirect to /login.
 * - /admin/* is a hidden portal: with no cookie we return the app's 404 page so the
 *   portal never advertises itself. The admin layout then verifies the admin identity.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/admin")) {
    if (!hasSession) return NextResponse.rewrite(new URL("/not-found", req.url), { status: 404 });
    const res = NextResponse.next();
    res.headers.set("x-robots-tag", "noindex, nofollow, noarchive");
    return res;
  }

  if (pathname.startsWith("/dashboard")) {
    if (!hasSession) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if ((pathname === "/login" || pathname === "/register") && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login", "/register"],
};
