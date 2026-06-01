export type UserInfo = {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  nickname?: string;
};

export type SessionData = {
  token: string;
  user: UserInfo;
  createdAt: Date;
};

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

export function createSession(token: string, user: UserInfo): string {
  const sessionId = crypto.randomUUID();
  store.set(sessionId, { token, user, createdAt: new Date() });
  return sessionId;
}

export function getSessionData(sessionId: string): SessionData | null {
  return store.get(sessionId) ?? null;
}

export function deleteSessionData(sessionId: string): void {
  store.delete(sessionId);
}
