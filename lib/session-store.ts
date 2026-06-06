import type { Collection } from 'mongodb';
import client from './mongodb';

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

type SessionDocument = {
  _id: string;
  user: UserInfo;
  createdAt: Date;
  expiresAt: Date;
};

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

declare global {
  // eslint-disable-next-line no-var
  var _sessionIndexEnsured: boolean | undefined;
}

async function getCollection(): Promise<Collection<SessionDocument>> {
  await client.connect();
  const col = client.db(process.env.MONGODB_DATABASE).collection<SessionDocument>('sessions');
  if (!globalThis._sessionIndexEnsured) {
    await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    globalThis._sessionIndexEnsured = true;
  }
  return col;
}

export async function createSession(user: UserInfo): Promise<string> {
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

export async function getSessionData(sessionId: string): Promise<SessionData | null> {
  const col = await getCollection();
  const doc = await col.findOne({ _id: sessionId });
  if (!doc) return null;
  return { user: doc.user, createdAt: doc.createdAt };
}

export async function deleteSessionData(sessionId: string): Promise<void> {
  const col = await getCollection();
  await col.deleteOne({ _id: sessionId });
}
