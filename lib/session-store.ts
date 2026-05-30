export type SessionData = {
  token: string;
  createdAt: Date;
};

// In-memory store — swap for Redis / DB in production.
// Each pod has its own store; sticky sessions or a shared store are needed
// once you run more than one replica.
const store = new Map<string, SessionData>();

export function createSession(token: string): string {
  const sessionId = crypto.randomUUID();
  store.set(sessionId, { token, createdAt: new Date() });
  return sessionId;
}

export function getSessionData(sessionId: string): SessionData | null {
  return store.get(sessionId) ?? null;
}

export function deleteSessionData(sessionId: string): void {
  store.delete(sessionId);
}
