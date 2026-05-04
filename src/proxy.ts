import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["en", "de", "fr", "es", "pt-BR"] as const;
const DEFAULT_LOCALE = "en";
const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

function normalizeLocale(locale: string): SupportedLocale | null {
  const normalized = locale.toLowerCase() === "pt-br" ? "pt-BR" : locale;
  if (SUPPORTED_LOCALES.includes(normalized as SupportedLocale)) {
    return normalized as SupportedLocale;
  }
  return null;
}

/**
 * Preferred locale without using URL segments (cookie → Accept-Language → default).
 */
function detectLocale(request: NextRequest): SupportedLocale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieLocale) {
    const normalized = normalizeLocale(cookieLocale);
    if (normalized) return normalized;
  }

  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(",")
      .map((lang) => {
        const [code, q = "q=1"] = lang.trim().split(";");
        const quality = parseFloat(q.replace("q=", "")) || 1;
        return { code: code.toLowerCase().split("-")[0], quality };
      })
      .sort((a, b) => b.quality - a.quality);

    for (const { code } of languages) {
      let mappedLocale: SupportedLocale | null = null;
      if (code === "en") mappedLocale = "en";
      else if (code === "de") mappedLocale = "de";
      else if (code === "fr") mappedLocale = "fr";
      else if (code === "es") mappedLocale = "es";
      else if (code === "pt") mappedLocale = "pt-BR";

      if (mappedLocale && SUPPORTED_LOCALES.includes(mappedLocale)) {
        return mappedLocale;
      }
    }
  }

  return DEFAULT_LOCALE;
}

/** Legacy URLs: /en/..., /de/..., etc. → same path without the first segment. */
function stripLegacyLocalePrefix(pathname: string): string | null {
  const match = pathname.match(/^\/([^/]+)(\/.*)?$/);
  if (!match) return null;
  const raw = match[1];
  const rest = match[2] ?? "";
  const loc = normalizeLocale(raw);
  if (!loc) return null;
  if (raw.toLowerCase() === "pt-br" && raw !== "pt-BR") {
    return (rest || "/") as string;
  }
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

  const stripped = stripLegacyLocalePrefix(pathname);
  if (stripped !== null) {
    url.pathname = stripped;
    url.search = search;
    const response = NextResponse.redirect(url, 308);
    const localeFromPath = pathname.match(/^\/([^/]+)/)?.[1];
    const pathLocale = localeFromPath ? normalizeLocale(localeFromPath) : null;
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
