import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
if (!process.env.MONGODB_DATABASE) throw new Error('MONGODB_DATABASE is not set');

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

const client: MongoClient =
  globalThis._mongoClient ??
  (globalThis._mongoClient = new MongoClient(process.env.MONGODB_URI));

export default client;
