import mongoose from "mongoose";

declare global {
  var __mongooseConn: Promise<typeof mongoose> | undefined;
}

export default async function connectDB() {
  if (global.__mongooseConn) {
    console.log("🔄 Using existing MongoDB connection");
    return global.__mongooseConn;
  }

  const uri = (process.env.MONGODB_URI || process.env.MONGO_URI || "").trim();
  
  console.log("🔍 Checking MongoDB connection...");
  console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
  console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
  console.log("URI length:", uri.length);
  console.log("URI starts with:", uri.substring(0, 20));
  
  if (!uri) {
    console.error("❌ No MongoDB URI found!");
    throw new Error("MONGODB_URI (or MONGO_URI) is missing");
  }

  console.log("🔌 Attempting to connect to MongoDB...");
  
  global.__mongooseConn = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  }).then((conn) => {
    console.log("✅ MongoDB connected successfully!");
    return conn;
  }).catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    throw err;
  });

  return global.__mongooseConn;
}