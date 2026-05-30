import { NextRequest, NextResponse } from 'next/server';

/**
 * Protects /dashboard and /profile by checking for the auth cookie.
 * Full JWT verification happens in Server Components and API Routes —
 * this is a fast edge-layer gate to redirect unauthenticated users early.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
};
