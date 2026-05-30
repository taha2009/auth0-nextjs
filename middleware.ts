import { NextRequest, NextResponse } from 'next/server';

/**
 * Protects /dashboard and /profile by checking for the session cookie.
 * Full session lookup + JWT verification happens in Server Components and
 * API Routes — this is a fast edge-layer gate to redirect early.
 */
export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;

  if (!sessionId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
};
