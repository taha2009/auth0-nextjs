import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getSessionData } from '@/lib/session-store';

/**
 * Returns the current user's profile.
 *
 * Reads the session ID from the cookie, looks up the JWT in the server-side
 * session store, verifies it, then fetches the full profile from Auth0's
 * /userinfo endpoint. The JWT never leaves the server.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;
  if (!sessionId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const data = getSessionData(sessionId);
  if (!data) {
    return NextResponse.json({ error: 'Session not found' }, { status: 401 });
  }

  try {
    await verifyToken(data.token);

    const userInfoRes = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      { headers: { Authorization: `Bearer ${data.token}` } }
    );

    if (!userInfoRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: userInfoRes.status }
      );
    }

    return NextResponse.json(await userInfoRes.json());
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
