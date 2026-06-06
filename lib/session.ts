import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { UserInfo } from './session-store';
import { deleteSessionData, getSessionData, updateSessionTokens } from './session-store';

export type Session = {
  sessionId: string;
  user: UserInfo;
  accessToken: string;
};

// Refresh 60 seconds before actual expiry to avoid races.
const EXPIRY_BUFFER_MS = 60 * 1000;

async function refreshAccessToken(sessionId: string, refreshToken: string): Promise<string | null> {
  const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } = process.env;

  const res = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    await deleteSessionData(sessionId);
    return null;
  }

  const tokens = await res.json();
  await updateSessionTokens(sessionId, {
    accessToken: tokens.access_token,
    // Auth0 may rotate the refresh token — use the new one if provided.
    refreshToken: tokens.refresh_token ?? refreshToken,
    accessTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
  });

  return tokens.access_token;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  if (!sessionId) return null;

  const data = await getSessionData(sessionId);
  if (!data) return null;

  let { accessToken } = data;

  if (data.accessTokenExpiresAt.getTime() - Date.now() < EXPIRY_BUFFER_MS) {
    if (!data.refreshToken) {
      await deleteSessionData(sessionId);
      return null;
    }
    const refreshed = await refreshAccessToken(sessionId, data.refreshToken);
    if (!refreshed) return null;
    accessToken = refreshed;
  }

  return { sessionId, user: data.user, accessToken };
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/');
  return session;
}
