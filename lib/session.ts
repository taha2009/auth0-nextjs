import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { UserInfo } from './session-store';
import { getSessionData } from './session-store';

export type Session = {
  sessionId: string;
  user: UserInfo;
};

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  if (!sessionId) return null;

  const data = await getSessionData(sessionId);
  if (!data) return null;

  return { sessionId, user: data.user };
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/');
  return session;
}
