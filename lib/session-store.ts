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

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days — matches the cookie maxAge

// In-memory store — swap for Redis / DB in production.
// Each pod has its own store; sticky sessions or a shared store are needed
// once you run more than one replica.
//
// Anchored on globalThis so that Turbopack's per-route module isolation in dev
// doesn't split the store across multiple Map instances.
declare global {
  // eslint-disable-next-line no-var
  var __sessionStore: Map<string, SessionData> | undefined;
}
const store: Map<string, SessionData> =
  globalThis.__sessionStore ?? (globalThis.__sessionStore = new Map());

export function createSession(user: UserInfo): string {
  const sessionId = crypto.randomUUID();
  store.set(sessionId, { user, createdAt: new Date() });
  return sessionId;
}

export function getSessionData(sessionId: string): SessionData | null {
  const data = store.get(sessionId);
  if (!data) return null;
  if (Date.now() - data.createdAt.getTime() > SESSION_TTL_MS) {
    store.delete(sessionId);
    return null;
  }
  return data;
}

export function deleteSessionData(sessionId: string): void {
  store.delete(sessionId);
}
