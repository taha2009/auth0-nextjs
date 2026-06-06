import { NextRequest, NextResponse } from 'next/server';
import { getSessionData } from '@/lib/session-store';

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;
  if (!sessionId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const data = await getSessionData(sessionId);
  if (!data) {
    return NextResponse.json({ error: 'Session not found' }, { status: 401 });
  }

  return NextResponse.json(data.user);
}
