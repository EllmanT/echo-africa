import { Db, MongoClient, MongoClientOptions } from "mongodb";

// Lazy connection: the site must keep rendering from static seed data when
// MONGODB_URI is missing (local dev without a DB, preview builds, DB outage).
const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

const globalWithMongo = globalThis as typeof globalThis & {
  _ekaMongoClientPromise?: Promise<MongoClient>;
};

function getClientPromise(): Promise<MongoClient> | null {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  if (!globalWithMongo._ekaMongoClientPromise) {
    const client = new MongoClient(uri, options);
    globalWithMongo._ekaMongoClientPromise = client.connect().catch((error) => {
      // Allow a retry on the next call instead of caching a rejected promise.
      globalWithMongo._ekaMongoClientPromise = undefined;
      throw error;
    });
  }
  return globalWithMongo._ekaMongoClientPromise;
}

export const DB_NAME = process.env.MONGODB_DB ?? "eka";

/** Returns the database, or null when no MONGODB_URI is configured. */
export async function getDb(): Promise<Db | null> {
  const promise = getClientPromise();
  if (!promise) return null;
  const client = await promise;
  return client.db(DB_NAME);
}

/** Like getDb but throws, for code paths that cannot work without storage (lead capture, admin). */
export async function requireDb(): Promise<Db> {
  const db = await getDb();
  if (!db) throw new Error("MONGODB_URI is not configured");
  return db;
}
