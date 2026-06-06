import { SignJWT, jwtVerify } from 'jose';

export type UserInfo = {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  nickname?: string;
};

export type SessionData = {
  user: UserInfo;
  createdAt: Date;
};

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function createSession(user: UserInfo): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function getSessionData(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      user: payload.user as UserInfo,
      createdAt: new Date((payload.iat ?? 0) * 1000),
    };
  } catch {
    return null;
  }
}

// Stateless — nothing to delete server-side; callers clear the cookie.
export function deleteSessionData(_token: string): void {}
