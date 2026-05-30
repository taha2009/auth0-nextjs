import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { JWTPayload } from 'jose';
import { verifyToken } from './auth';
import { getSessionData } from './session-store';

export type Session = {
  sessionId: string;
  token: string;
  payload: JWTPayload;
};

/**
 * Reads the session_id cookie, looks up the JWT in the session store,
 * and verifies it. Returns null if the session is missing or the token
 * is invalid/expired.
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  if (!sessionId) return null;

  const data = getSessionData(sessionId);
  if (!data) return null;

  try {
    const payload = await verifyToken(data.token);
    return { sessionId, token: data.token, payload };
  } catch {
    return null;
  }
}

/**
 * Like getSession(), but redirects to / when there is no valid session.
 * Use in protected Server Components.
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/');
  return session;
}
