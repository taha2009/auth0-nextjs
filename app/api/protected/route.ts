import { NextRequest, NextResponse } from 'next/server';
import { getSessionData } from '@/lib/session-store';

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;
  if (!sessionId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const data = getSessionData(sessionId);
  if (!data) {
    return NextResponse.json({ error: 'Session not found' }, { status: 401 });
  }

  return NextResponse.json({
    message: 'Access granted to protected resource',
    subject: data.user.sub,
    data: {
      secret: 'This data is only accessible to authenticated users',
      timestamp: new Date().toISOString(),
    },
  });
}
