import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConn: Promise<typeof mongoose> | undefined;
}

function ensureDbInUri(uri: string, dbName: string | undefined): string {
  if (!uri) return uri;
  if (!dbName) return uri;

  // Separate base and query string
  const [base, qs] = uri.split("?");
  const marker = ".mongodb.net/";
  const idx = base.indexOf(marker);
  if (idx === -1) return uri; // unexpected format

  const after = base.substring(idx + marker.length); // what’s after host
  const hasPath = after.length > 0; // already has "/something"
  if (hasPath) return uri; // DB already present

  const newBase = base.endsWith("/") ? `${base}${dbName}` : `${base}/${dbName}`;
  return qs ? `${newBase}?${qs}` : newBase;
}

export default async function connectDB() {
  if (global.__mongooseConn) {
    console.log("🔄 Using existing MongoDB connection");
    return global.__mongooseConn;
  }

  // Prefer the integration secret
  const rawUri = (process.env.MONGODB_URI || process.env.MONGO_URI || "").trim();
  const dbName = (process.env.MONGODB_DB || "NEXO").trim();

  console.log("🔍 Checking MongoDB connection...");
  console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
  console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
  console.log("MONGODB_DB:", dbName);

  if (!rawUri) {
    console.error("❌ No MongoDB URI found!");
    throw new Error("MONGODB_URI (or MONGO_URI) is missing");
  }

  const uri = ensureDbInUri(rawUri, dbName);
  console.log("🔌 Attempting to connect to MongoDB...");

  // Defensive: close any stale state in serverless
  if (mongoose.connection.readyState !== 0) {
    try {
      console.log("⚠️ Closing existing mongoose connection...");
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  }

  global.__mongooseConn = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4, // prefer IPv4
    })
    .then((conn) => {
      console.log("✅ MongoDB connected successfully!");
      console.log("📊 Connection state:", mongoose.connection.readyState);
      return conn;
    })
    .catch((err) => {
      console.error("❌ MongoDB connection failed!");
      console.error("Error name:", err.name);
      console.error("Error message:", err.message);
      global.__mongooseConn = undefined; // so next request can retry
      throw err;
    });

  return global.__mongooseConn;
}