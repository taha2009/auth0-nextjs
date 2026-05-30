import { NextResponse } from 'next/server';

export async function GET() {
  const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, APP_BASE_URL } = process.env;

  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !APP_BASE_URL) {
    return NextResponse.json({ error: 'Auth0 is not configured' }, { status: 500 });
  }

  const params = new URLSearchParams({
    client_id: AUTH0_CLIENT_ID,
    returnTo: APP_BASE_URL,
  });

  // Redirect to Auth0's logout endpoint, which invalidates the Auth0 session.
  // Without this, the user could be silently re-authenticated on the next login.
  const response = NextResponse.redirect(
    `https://${AUTH0_DOMAIN}/v2/logout?${params.toString()}`
  );

  // Clear the local auth cookie
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
