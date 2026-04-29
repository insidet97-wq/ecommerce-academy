import { NextResponse, type NextRequest } from "next/server";

/**
 * Apex → www redirect, with a carve-out for /ads.txt.
 *
 * Why this exists:
 * Vercel's project-level domain config used to redirect firstsalelab.com →
 * www.firstsalelab.com at the edge, BEFORE any code ran. That broke ads.txt:
 * AdSense's crawler hits the apex (the domain registered with AdSense), got a
 * 307 redirect, and reported "Ads.txt status: Not found" because Google's
 * crawler doesn't reliably follow redirects for ads.txt.
 *
 * The fix:
 *   1. Disable the Vercel-level apex→www redirect (Project Settings → Domains)
 *   2. This middleware reproduces the redirect for everything EXCEPT /ads.txt
 *
 * Net result:
 *   - firstsalelab.com/ads.txt        → 200 OK (file served from /public)
 *   - firstsalelab.com/anything-else  → 308 redirect to www
 *   - www.firstsalelab.com/*          → unchanged
 */
export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const url  = req.nextUrl;

  // Only act on the apex host. www and preview/dev hostnames pass through.
  const isApex = host === "firstsalelab.com";
  if (!isApex) return NextResponse.next();

  // ads.txt must be served directly from the apex — no redirect.
  // (AdSense crawler doesn't reliably follow 3xx for this file.)
  if (url.pathname === "/ads.txt") return NextResponse.next();

  // Everything else on the apex: 308 permanent redirect to www, preserving path + query.
  const wwwUrl = new URL(url.toString());
  wwwUrl.host = "www.firstsalelab.com";
  return NextResponse.redirect(wwwUrl, 308);
}

/**
 * Match every request EXCEPT Next.js internals and static files.
 * (Static files like /favicon.ico, /_next/* are served from the edge cache and
 * don't need to hit middleware.)
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/ads.txt",  // explicit include since the pattern above excludes dotted paths
  ],
};
