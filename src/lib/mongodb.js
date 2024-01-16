import { MongoClient } from "mongodb";

if (
  !import.meta.env.MONGODB_USER ||
  !import.meta.env.MONGODB_NAME ||
  !import.meta.env.MONGODB_PASSWORD
) {
  throw new Error('Invalid environment variable: "MONGODB_URI"');
}

const user = import.meta.env.MONGODB_USER;
const password = import.meta.env.MONGODB_PASSWORD;
const dbName = import.meta.env.MONGODB_NAME;

const uri = `mongodb+srv://${user}:${password}@cluster0.ixnp3ii.mongodb.net/?retryWrites=true&w=majority`;
const options = {};
let cachedMongo;

const connectToDB = async () => {
  const mongo = await new MongoClient(uri, options).connect();
  return mongo.db(dbName);
};

export const getDB = async () => {
  if (import.meta.env.NODE_ENV === "development") {
    if (!global._mongoConnection) {
      global._mongoConnection = await connectToDB();
      cachedMongo = global._mongoConnection;
    }
    return cachedMongo;
  }
  const mongo = await connectToDB();
  return mongo;
};

export const Posts = async () => {
  const db = await getDB();
  return db.collection("posts");
};
