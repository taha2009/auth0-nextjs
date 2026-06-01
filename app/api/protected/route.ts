import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getSessionData } from '@/lib/session-store';

/**
 * Simulates a resource server endpoint.
 *
 * Reads the session ID cookie, retrieves the JWT access token from the
 * server-side store, then verifies it against Auth0's JWKS — exactly
 * what a separate resource server would do when it receives the token
 * as an Authorization: Bearer header.
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
    const payload = await verifyToken(data.token);

    return NextResponse.json({
      message: 'Access granted to protected resource',
      subject: payload.sub,
      data: {
        secret: 'This data is only accessible to authenticated users',
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
