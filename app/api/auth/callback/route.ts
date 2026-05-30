import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, APP_BASE_URL } =
    process.env;

  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET || !APP_BASE_URL) {
    return NextResponse.json({ error: 'Auth0 is not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `${APP_BASE_URL}?error=${encodeURIComponent(error)}`
    );
  }

  // Verify CSRF state
  const storedState = request.cookies.get('auth_state')?.value;
  if (!state || state !== storedState) {
    return NextResponse.redirect(`${APP_BASE_URL}?error=invalid_state`);
  }

  if (!code) {
    return NextResponse.redirect(`${APP_BASE_URL}?error=missing_code`);
  }

  try {
    // Exchange the authorization code for tokens
    const tokenRes = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: AUTH0_CLIENT_ID,
        client_secret: AUTH0_CLIENT_SECRET,
        code,
        redirect_uri: `${APP_BASE_URL}/api/auth/callback`,
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokenRes.ok) {
      throw new Error(tokens.error_description || 'Token exchange failed');
    }

    const response = NextResponse.redirect(`${APP_BASE_URL}/dashboard`);

    // Clean up the state cookie
    response.cookies.set('auth_state', '', { maxAge: 0, path: '/' });

    // Store the access token in an HTTP-only cookie.
    // HTTP-only prevents JavaScript from reading it, mitigating XSS token theft.
    response.cookies.set('auth_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    return NextResponse.redirect(
      `${APP_BASE_URL}?error=${encodeURIComponent(message)}`
    );
  }
}
