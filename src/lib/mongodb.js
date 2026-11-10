import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Defina MONGODB_URI no .env.local");


if (!globalThis._mongoPromise) {
  globalThis._mongoPromise = new MongoClient(uri).connect();
}

export async function getDb() {
  const client = await globalThis._mongoPromise;
  return client.db(process.env.MONGODB_DB || "wifi");
}
