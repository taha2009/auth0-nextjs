import type { Collection } from 'mongodb';
import client from './mongodb';

export type UserInfo = {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  nickname?: string;
};

export type SessionTokens = {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt: Date;
};

export type SessionData = {
  user: UserInfo;
  createdAt: Date;
} & SessionTokens;

type SessionDocument = {
  _id: string;
  user: UserInfo;
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt: Date;
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

export async function createSession(user: UserInfo, tokens: SessionTokens): Promise<string> {
  const col = await getCollection();
  const sessionId = crypto.randomUUID();
  const now = new Date();
  await col.insertOne({
    _id: sessionId,
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenExpiresAt: tokens.accessTokenExpiresAt,
    createdAt: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
  });
  return sessionId;
}

export async function updateSessionTokens(sessionId: string, tokens: SessionTokens): Promise<void> {
  const col = await getCollection();
  await col.updateOne(
    { _id: sessionId },
    {
      $set: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      },
    }
  );
}

export async function getSessionData(sessionId: string): Promise<SessionData | null> {
  const col = await getCollection();
  const doc = await col.findOne({ _id: sessionId });
  if (!doc) return null;
  return {
    user: doc.user,
    accessToken: doc.accessToken,
    refreshToken: doc.refreshToken,
    accessTokenExpiresAt: doc.accessTokenExpiresAt,
    createdAt: doc.createdAt,
  };
}

export async function deleteSessionData(sessionId: string): Promise<void> {
  const col = await getCollection();
  await col.deleteOne({ _id: sessionId });
}
