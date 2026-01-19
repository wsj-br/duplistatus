import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_LOCALES = ["en", "de", "fr", "es", "pt-BR"] as const;
const DEFAULT_LOCALE = "en";
const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Normalizes a locale string to the canonical format.
 * Accepts both "pt-br" and "pt-BR" and normalizes to "pt-BR".
 */
function normalizeLocale(locale: string): SupportedLocale | null {
  const normalized = locale.toLowerCase() === "pt-br" ? "pt-BR" : locale;
  if (SUPPORTED_LOCALES.includes(normalized as SupportedLocale)) {
    return normalized as SupportedLocale;
  }
  return null;
}

/**
 * Detects the user's preferred locale from multiple sources (priority order):
 * 1. URL path (if already has locale prefix)
 * 2. Cookie (persisted preference)
 * 3. Accept-Language header (browser language)
 * 4. Default locale (en)
 */
function detectLocale(request: NextRequest): SupportedLocale {
  const { pathname } = request.nextUrl;

  // 1. Check if URL already has a locale prefix
  const pathLocaleMatch = pathname.match(/^\/([^/]+)/);
  if (pathLocaleMatch) {
    const pathLocale = pathLocaleMatch[1];
    const normalized = normalizeLocale(pathLocale);
    if (normalized) {
      return normalized;
    }
  }

  // 2. Check cookie for persisted locale preference
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieLocale) {
    const normalized = normalizeLocale(cookieLocale);
    if (normalized) {
      return normalized;
    }
  }

  // 3. Check Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    // Parse Accept-Language header (e.g., "en-US,en;q=0.9,de;q=0.8")
    const languages = acceptLanguage
      .split(",")
      .map((lang) => {
        const [code, q = "q=1"] = lang.trim().split(";");
        const quality = parseFloat(q.replace("q=", "")) || 1;
        return { code: code.toLowerCase().split("-")[0], quality };
      })
      .sort((a, b) => b.quality - a.quality);

    for (const { code } of languages) {
      // Map language codes to our supported locales
      let mappedLocale: SupportedLocale | null = null;
      if (code === "en") mappedLocale = "en";
      else if (code === "de") mappedLocale = "de";
      else if (code === "fr") mappedLocale = "fr";
      else if (code === "es") mappedLocale = "es";
      else if (code === "pt") mappedLocale = "pt-BR"; // Brazilian Portuguese

      if (mappedLocale && SUPPORTED_LOCALES.includes(mappedLocale)) {
        return mappedLocale;
      }
    }
  }

  // 4. Fallback to default locale
  return DEFAULT_LOCALE;
}

/**
 * Checks if a pathname already has a locale prefix
 */
function hasLocalePrefix(pathname: string): boolean {
  const match = pathname.match(/^\/([^/]+)/);
  if (!match) return false;
  return normalizeLocale(match[1]) !== null;
}

/**
 * Adds locale prefix to a pathname
 */
function addLocalePrefix(pathname: string, locale: SupportedLocale): string {
  // Remove leading slash if present, then add locale
  const cleanPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  return `/${locale}${cleanPath ? `/${cleanPath}` : ""}`;
}

/**
 * Removes locale prefix from a pathname if present
 */
function removeLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/([^/]+)(\/.*)?$/);
  if (match && normalizeLocale(match[1])) {
    return match[2] || "/";
  }
  return pathname;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const url = request.nextUrl.clone();

  // Skip processing for:
  // - API routes
  // - _next (Next.js internals)
  // - Static files (files with extensions)
  // - Files in public directory (favicon, images, etc.)
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/_static/") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|css|js|json|xml|txt|pdf)$/i)
  ) {
    // For skipped paths, still set headers but don't do locale handling
    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    response.headers.set('x-search-params', search);
    return response;
  }

  // Handle locale detection and routing
  let response: NextResponse;
  let finalPathname = pathname;

  // If pathname already has a valid locale prefix, extract it and ensure cookie is set
  if (hasLocalePrefix(pathname)) {
    const pathLocaleMatch = pathname.match(/^\/([^/]+)/);
    const rawLocale = pathLocaleMatch![1];
    const pathLocale = normalizeLocale(rawLocale);
    if (!pathLocale) {
      // Should not happen if hasLocalePrefix returned true, but handle gracefully
      const locale = detectLocale(request);
      const pathWithoutLocale = removeLocalePrefix(pathname);
      const newPathname = addLocalePrefix(pathWithoutLocale, locale);
      url.pathname = newPathname;
      response = NextResponse.redirect(url);
      response.cookies.set(LOCALE_COOKIE_NAME, locale, {
        maxAge: LOCALE_COOKIE_MAX_AGE,
        path: "/",
        sameSite: "lax",
        httpOnly: false,
      });
      finalPathname = newPathname;
      response.headers.set('x-pathname', finalPathname);
      response.headers.set('x-search-params', search);
      return response;
    }
    
    // If the URL has pt-br (lowercase), redirect to pt-BR (canonical form)
    if (rawLocale.toLowerCase() === "pt-br" && rawLocale !== "pt-BR") {
      const pathWithoutLocale = removeLocalePrefix(pathname);
      const newPathname = addLocalePrefix(pathWithoutLocale, pathLocale);
      url.pathname = newPathname;
      response = NextResponse.redirect(url);
      response.cookies.set(LOCALE_COOKIE_NAME, pathLocale, {
        maxAge: LOCALE_COOKIE_MAX_AGE,
        path: "/",
        sameSite: "lax",
        httpOnly: false,
      });
      finalPathname = newPathname;
      response.headers.set('x-pathname', finalPathname);
      response.headers.set('x-search-params', search);
      return response;
    }
    
    response = NextResponse.next();
    // Set/update locale cookie to match URL (user may have manually changed locale)
    // Always use normalized locale (pt-BR) in cookie
    response.cookies.set(LOCALE_COOKIE_NAME, pathLocale, {
      maxAge: LOCALE_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
      httpOnly: false, // Allow client-side access for useLocale hook
    });
    finalPathname = pathname;
  } else {
    // Pathname doesn't have locale prefix - detect preferred locale and redirect
    const locale = detectLocale(request);
    const pathWithoutLocale = removeLocalePrefix(pathname);
    const newPathname = addLocalePrefix(pathWithoutLocale, locale);
    url.pathname = newPathname;

    // Create redirect response with locale cookie
    response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE_NAME, locale, {
      maxAge: LOCALE_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
    finalPathname = newPathname;
  }

  // Set custom headers
  // These headers will be accessible via headers() in server components
  response.headers.set('x-pathname', finalPathname);
  response.headers.set('x-search-params', search);
  
  // Set cache control headers for dashboard and detail pages to prevent caching
  // This ensures fresh data is loaded when users refresh the page (CTRL-R)
  if ((finalPathname === '/' || finalPathname.startsWith('/detail/') || finalPathname.match(/^\/[^/]+\/$/) || finalPathname.match(/^\/[^/]+\/detail\//)) && !finalPathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Files with extensions (static assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
