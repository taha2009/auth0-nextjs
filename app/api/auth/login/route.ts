import { NextResponse } from 'next/server';

export async function GET() {
  const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_AUDIENCE, AUTH0_SCOPE, APP_BASE_URL } =
    process.env;

  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !APP_BASE_URL) {
    return NextResponse.json({ error: 'Auth0 is not configured' }, { status: 500 });
  }

  // Generate a random state value to protect against CSRF attacks.
  // We store it in a short-lived cookie and verify it in the callback.
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: AUTH0_CLIENT_ID,
    redirect_uri: `${APP_BASE_URL}/api/auth/callback`,
    scope: AUTH0_SCOPE || 'openid profile email',
    state,
  });

  if (AUTH0_AUDIENCE) {
    params.append('audience', AUTH0_AUDIENCE);
  }

  const response = NextResponse.redirect(
    `https://${AUTH0_DOMAIN}/authorize?${params.toString()}`
  );

  response.cookies.set('auth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes — just long enough for the user to complete login
    path: '/',
  });

  return response;
}
