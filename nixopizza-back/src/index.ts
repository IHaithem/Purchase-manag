import express, { Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import bcrypt from "bcryptjs";
import connectDB from "./config/database";

// routers
import authRouter from "./routes/auth.router";
import productRouter from "./routes/product.router";
import categoryRouter from "./routes/category.router";
import orderRouter from "./routes/order.router";
import adminRouter from "./routes/admin.router";
import { initializeExpirationMonitoring } from "./controllers/expirationMonitoring.controller";
import User from "./models/user.model";
import taskRouter from "./routes/task.router";
import supplierRouter from "./routes/supplier.router";
import notificationRouter from "./routes/notification.router";


// Only load .env file in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const UPLOADS_DIR = path.resolve("src/uploads");
app.use("/uploads", express.static(UPLOADS_DIR));

const allowedOrigins = [
  process.env.CLIENT_ORIGIN ?? "",
  process.env.ADMIN_ORIGIN ?? "",
  process.env.PROD_CLIENT_ORIGIN ?? "",
  process.env.PROD_ADMIN_ORIGIN ?? "",
  "https://purchase-manag-front-8pifqimlc-haithem-fellahs-projects.vercel.app/",
  "http://localhost:3000", // For local development
  "http://localhost:3001", // For local development (if different port)
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/suppliers", supplierRouter);
app.use("/api/notifications", notificationRouter);

const PORT = process.env.PORT || 5000;

async function ensureAdmin() {
  const fullname = process.env.ADMIN_FULLNAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!fullname || !email || !password) {
    console.warn(
      "⚠️ ADMIN_FULLNAME, ADMIN_EMAIL or ADMIN_PASSWORD not set in .env"
    );
    return;
  }

  const existingAdmin = await User.findOne({ email, role: "admin" });
  if (existingAdmin) {
    console.log("✅ Admin already exists:", existingAdmin.email);
    return;
  }

  const admin = await User.create({
    fullname,
    email,
    password,
    role: "admin",
  });

  console.log("🚀 Admin created:", admin.email);
}

let isInitialized = false;

const initializeApp = async () => {
  if (isInitialized) {
    console.log("🔄 App already initialized");
    return;
  }

  try {
    console.log("🔍 Initializing app...");
    console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
    console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
    
    // FIRST: Connect to database and WAIT for it
    console.log("🔌 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB connected successfully!");
    
    // SECOND: Create admin user (requires DB connection)
    console.log("👤 Checking admin user...");
    await ensureAdmin();
    
    // THIRD: Initialize monitoring (requires DB connection)
    console.log("📊 Initializing expiration monitoring...");
    initializeExpirationMonitoring();
    
    isInitialized = true;
    console.log("✅ App initialization complete!");
  } catch (err) {
    console.error("❌ Failed to initialize app:", err);
    // Mark as not initialized so it retries on next request
    isInitialized = false;
  }
};

// Initialize on module load
initializeApp().catch(err => {
  console.error("❌ Initialization error:", err);
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Export for Vercel
export default app;