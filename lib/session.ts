import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { JWTPayload } from 'jose';
import { verifyToken } from './auth';

export type Session = {
  token: string;
  payload: JWTPayload;
};

/**
 * Reads the auth_token cookie and verifies it.
 * Returns null if the cookie is absent or the token is invalid/expired.
 * Safe to call from Server Components and Route Handlers.
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    return { token, payload };
  } catch {
    return null;
  }
}

/**
 * Like getSession(), but redirects to / when there is no valid session.
 * Use this in protected Server Components to enforce authentication.
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/');
  return session;
}
