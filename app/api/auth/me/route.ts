import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

/**
 * Returns the current user's profile.
 *
 * Verifies the JWT locally (no Auth0 roundtrip), then fetches the full
 * profile from Auth0's /userinfo endpoint which includes name, email, picture.
 *
 * This is the pattern for Client Components that need user data — they
 * fetch this route rather than calling verifyToken() directly (which is
 * server-only via 'next/headers').
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Verify the token is valid and not expired
    await verifyToken(token);

    // Fetch the full user profile from Auth0
    const userInfoRes = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!userInfoRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: userInfoRes.status }
      );
    }

    const userInfo = await userInfoRes.json();
    return NextResponse.json(userInfo);
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
