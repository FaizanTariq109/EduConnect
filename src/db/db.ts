import mongoose from "mongoose";

type Cache = { promise: Promise<typeof mongoose> | null };
const globalMongo = globalThis as typeof globalThis & { eduMongo?: Cache };
const cache = (globalMongo.eduMongo ??= { promise: null });
export async function connect() {
  if (mongoose.connection.readyState === 1) return mongoose;
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("Database configuration is missing");
  if (!cache.promise)
    cache.promise = mongoose
      .connect(uri, {
        maxPoolSize: 5,
        minPoolSize: 0,
        serverSelectionTimeoutMS: 8000,
        autoIndex: false,
      })
      .catch((error) => {
        cache.promise = null;
        throw error;
      });
  const result = await cache.promise;
  if (result.connection.readyState !== 1) {
    cache.promise = null;
    return connect();
  }
  return result;
}
