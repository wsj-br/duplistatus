import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  // Get pathname and search params from the request
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams.toString();

  // Rewrite Docusaurus clean URLs under /docs to index.html
  // (standalone output doesn't include a custom server to do this mapping)
  // Docusaurus with trailingSlash: false generates .html files, not index.html directories
  const rewriteResponse = (() => {
    if (!pathname.startsWith('/docs')) {
      return null;
    }

    // Don't rewrite assets or explicit files.
    const lastSegment = pathname.split('/').filter(Boolean).at(-1) ?? '';
    if (lastSegment.includes('.')) {
      return null;
    }

    const url = request.nextUrl.clone();

    // /docs or /docs/ -> /docs/index.html
    if (pathname === '/docs' || pathname === '/docs/') {
      url.pathname = '/docs/index.html';
      return NextResponse.rewrite(url);
    }

    // For Docusaurus with trailingSlash: false, paths like /docs/user-guide/overview
    // are generated as /docs/user-guide/overview.html, not /docs/user-guide/overview/index.html
    // Try .html first (Docusaurus default with trailingSlash: false)
    if (!pathname.endsWith('/')) {
      // Try .html file first (Docusaurus with trailingSlash: false)
      url.pathname = `${pathname}.html`;
      return NextResponse.rewrite(url);
    }

    // /docs/foo/ -> /docs/foo/index.html (for trailingSlash: true case)
    url.pathname = `${pathname}index.html`;
    return NextResponse.rewrite(url);
  })();

  // Create response and set custom headers
  // These headers will be accessible via headers() in server components
  const response = rewriteResponse ?? NextResponse.next();
  response.headers.set('x-pathname', pathname);
  response.headers.set('x-search-params', searchParams);
  
  return response;
}

export const config = {
  // Match all request paths except static files and API routes that don't need this
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
