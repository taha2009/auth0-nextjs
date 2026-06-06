import type { Collection } from 'mongodb';
import mongoClient from './mongodb';

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

// ── In-memory fallback ───────────────────────────────────────────────────────

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

declare global {
  // eslint-disable-next-line no-var
  var __sessionStore: Map<string, SessionData & { expiresAt: Date }> | undefined;
}
const memStore = (): Map<string, SessionData & { expiresAt: Date }> =>
  globalThis.__sessionStore ?? (globalThis.__sessionStore = new Map());

function memCreate(user: UserInfo): string {
  const sessionId = crypto.randomUUID();
  const now = new Date();
  memStore().set(sessionId, { user, createdAt: now, expiresAt: new Date(now.getTime() + SESSION_TTL_MS) });
  return sessionId;
}

function memGet(sessionId: string): SessionData | null {
  const data = memStore().get(sessionId);
  if (!data) return null;
  if (Date.now() > data.expiresAt.getTime()) {
    memStore().delete(sessionId);
    return null;
  }
  return { user: data.user, createdAt: data.createdAt };
}

function memDelete(sessionId: string): void {
  memStore().delete(sessionId);
}

// ── MongoDB ──────────────────────────────────────────────────────────────────

type SessionDocument = {
  _id: string;
  user: UserInfo;
  createdAt: Date;
  expiresAt: Date;
};

declare global {
  // eslint-disable-next-line no-var
  var _sessionIndexEnsured: boolean | undefined;
}

async function getCollection(): Promise<Collection<SessionDocument>> {
  await mongoClient!.connect();
  const col = mongoClient!
    .db(process.env.MONGODB_DATABASE)
    .collection<SessionDocument>('sessions');
  if (!globalThis._sessionIndexEnsured) {
    await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    globalThis._sessionIndexEnsured = true;
  }
  return col;
}

async function mongoCreate(user: UserInfo): Promise<string> {
  const col = await getCollection();
  const sessionId = crypto.randomUUID();
  const now = new Date();
  await col.insertOne({
    _id: sessionId,
    user,
    createdAt: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
  });
  return sessionId;
}

async function mongoGet(sessionId: string): Promise<SessionData | null> {
  const col = await getCollection();
  const doc = await col.findOne({ _id: sessionId });
  if (!doc) return null;
  return { user: doc.user, createdAt: doc.createdAt };
}

async function mongoDelete(sessionId: string): Promise<void> {
  const col = await getCollection();
  await col.deleteOne({ _id: sessionId });
}

// ── Public API ───────────────────────────────────────────────────────────────

const useMongo = (): boolean => mongoClient !== null;

export async function createSession(user: UserInfo): Promise<string> {
  return useMongo() ? mongoCreate(user) : memCreate(user);
}

export async function getSessionData(sessionId: string): Promise<SessionData | null> {
  return useMongo() ? mongoGet(sessionId) : memGet(sessionId);
}

export async function deleteSessionData(sessionId: string): Promise<void> {
  return useMongo() ? mongoDelete(sessionId) : memDelete(sessionId);
}
