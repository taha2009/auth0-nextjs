import { NextRequest, NextResponse } from 'next/server';
import { deleteSessionData } from '@/lib/session-store';

export async function GET(request: NextRequest) {
  const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, APP_BASE_URL } = process.env;

  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !APP_BASE_URL) {
    return NextResponse.json({ error: 'Auth0 is not configured' }, { status: 500 });
  }

  // Remove the session from the server-side store
  const sessionId = request.cookies.get('session_id')?.value;
  if (sessionId) deleteSessionData(sessionId);

  const params = new URLSearchParams({
    client_id: AUTH0_CLIENT_ID,
    returnTo: APP_BASE_URL,
  });

  const response = NextResponse.redirect(
    `https://${AUTH0_DOMAIN}/v2/logout?${params.toString()}`
  );

  response.cookies.set('session_id', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
