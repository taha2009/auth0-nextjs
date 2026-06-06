import { MongoClient } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

const uri = process.env.MONGODB_URI;

const client: MongoClient | null = uri
  ? (globalThis._mongoClient ?? (globalThis._mongoClient = new MongoClient(uri)))
  : null;

export default client;
