import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getSessionData } from '@/lib/session-store';

/**
 * Example protected API route.
 *
 * Reads the session ID from the cookie, retrieves the JWT from the server-side
 * session store, and verifies it before serving data. The JWT never travels
 * to the browser — only the opaque session ID does.
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
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}
