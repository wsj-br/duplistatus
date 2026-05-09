import { NextRequest, NextResponse } from "next/server";
import {
  SOURCE_LOCALE,
  LOCALE_COOKIE_NAME,
  parseLocaleTag,
  resolveLocaleFromAcceptLanguage,
  type LocaleCode,
} from "@/lib/locales";

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Preferred locale without using URL segments (cookie → Accept-Language → default).
 */
function detectLocale(request: NextRequest): LocaleCode {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieLocale) {
    const parsed = parseLocaleTag(cookieLocale);
    if (parsed) return parsed;
  }

  const fromAccept = resolveLocaleFromAcceptLanguage(
    request.headers.get("accept-language"),
  );
  return fromAccept ?? SOURCE_LOCALE;
}

/**
 * Legacy bookmark support only: locale-first paths redirect to canonical routes and set NEXT_LOCALE.
 * Normal navigation uses cookie-driven language without URL segments (see ai-i18n-tools pattern).
 */
function stripLocalePathPrefix(pathname: string): string | null {
  const match = pathname.match(/^\/([^/]+)(\/.*)?$/);
  if (!match) return null;
  const raw = match[1];
  const rest = match[2] ?? "";
  const loc = parseLocaleTag(raw);
  if (!loc) return null;
  return rest || "/";
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const url = request.nextUrl.clone();

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/_static/") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|css|js|json|xml|txt|pdf)$/i)
  ) {
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    response.headers.set("x-search-params", search);
    return response;
  }

  const stripped = stripLocalePathPrefix(pathname);
  if (stripped !== null) {
    url.pathname = stripped;
    url.search = search;
    const response = NextResponse.redirect(url, 308);
    const localeFromPath = pathname.match(/^\/([^/]+)/)?.[1];
    const pathLocale = localeFromPath ? parseLocaleTag(localeFromPath) : null;
    if (pathLocale) {
      response.cookies.set(LOCALE_COOKIE_NAME, pathLocale, {
        maxAge: LOCALE_COOKIE_MAX_AGE,
        path: "/",
        sameSite: "lax",
        httpOnly: false,
      });
    }
    response.headers.set("x-pathname", stripped);
    response.headers.set("x-search-params", search);
    return response;
  }

  const locale = detectLocale(request);
  const response = NextResponse.next();
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });
  response.headers.set("x-pathname", pathname);
  response.headers.set("x-search-params", search);

  const finalPathname = pathname;
  if (
    finalPathname === "/" ||
    finalPathname.startsWith("/detail/") ||
    finalPathname.startsWith("/settings") ||
    finalPathname.startsWith("/login")
  ) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
