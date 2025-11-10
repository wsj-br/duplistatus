import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  // Get pathname and search params from the request
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams.toString();
  
  // Create response and set custom headers
  // These headers will be accessible via headers() in server components
  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);
  if (searchParams) {
    response.headers.set('x-search-params', searchParams);
  } else {
    // Set empty string to distinguish from missing header
    response.headers.set('x-search-params', '');
  }
  
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

