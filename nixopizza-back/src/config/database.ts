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
  
  // Disconnect any existing connection first
  if (mongoose.connection.readyState !== 0) {
    console.log("⚠️ Closing existing connection...");
    await mongoose.disconnect();
  }
  
  global.__mongooseConn = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,  // 30 seconds
    socketTimeoutMS: 45000,            // 45 seconds
    connectTimeoutMS: 30000,           // 30 seconds
    family: 4,                         // Use IPv4, skip trying IPv6
  }).then((conn) => {
    console.log("✅ MongoDB connected successfully!");
    console.log("📊 Connection state:", mongoose.connection.readyState);
    return conn;
  }).catch((err) => {
    console.error("❌ MongoDB connection failed!");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    global.__mongooseConn = undefined; // Clear the failed connection
    throw err;
  });

  return global.__mongooseConn;
}