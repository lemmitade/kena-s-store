// ============================================================================
// NEXT.JS PROXY (AUTH GUARD): PROTECT ADMIN PORTAL
// Redirects unauthenticated access to /admin/login
// ============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('kena_admin_token')?.value;

  // 1. Handling the login route
  if (pathname === '/admin/login') {
    if (token) {
      // Already authenticated -> send to dashboard
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Set header flag so admin layout renders without sidebar
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-is-admin-login', 'true');
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 2. Handling all other /admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
