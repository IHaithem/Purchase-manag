import express, { Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import connectDB from "./config/database";

import authRouter from "./routes/auth.router";
import productRouter from "./routes/product.router";
import categoryRouter from "./routes/category.router";
import orderRouter from "./routes/order.router";
import adminRouter from "./routes/admin.router";
import taskRouter from "./routes/task.router";
import supplierRouter from "./routes/supplier.router";
import notificationRouter from "./routes/notification.router";
import blobUploadRouter from "./routes/blobUpload.router";
import User from "./models/user.model";
import { initializeExpirationMonitoring } from "./controllers/expirationMonitoring.controller";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Static legacy uploads (still needed for old avatar/image paths)
const UPLOADS_DIR = path.resolve("src/uploads");
app.use("/uploads", express.static(UPLOADS_DIR));

/**
 * Simplified CORS configuration (removed verbose debug + endpoints).
 * Allow explicit origins from environment variables; allow requests without origin (e.g., curl).
 */
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.ADMIN_ORIGIN,
  process.env.PROD_CLIENT_ORIGIN,
  process.env.PROD_ADMIN_ORIGIN,
  process.env.STAG_CLIENT_ORIGIN,
  process.env.STAG_ADMIN_ORIGIN,
  process.env.DEV_CLIENT_ORIGIN,
  process.env.DEV_ADMIN_ORIGIN,
]
  .filter(Boolean)
  .map((o) => o!.replace(/\/+$/, "")); // normalize

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      const clean = origin.replace(/\/+$/, "");
      if (allowedOrigins.includes(clean)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Basic health (keep)
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// Removed: /api/debug-cors and /api/debug-db endpoints & detailed console diagnostics

app.use("/api/uploads", blobUploadRouter);

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
  try {
    const fullname = (process.env.ADMIN_FULLNAME || "").trim();
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const password = (process.env.ADMIN_PASSWORD || "").trim();

    if (!fullname || !email || !password) return;

    const existingAdmin = await User.findOne({ email, role: "admin" });
    if (existingAdmin) return;

    await User.create({ fullname, email, password, role: "admin" });
  } catch (e) {
    console.error("ensureAdmin error:", (e as any).message);
  }
}

let initialized = false;
async function initializeApp() {
  if (initialized) return;
  try {
    await connectDB();
    await ensureAdmin();
    initializeExpirationMonitoring();
    initialized = true;
    if (process.env.NODE_ENV !== "production") {
      console.log("Server initialized");
    }
  } catch (err) {
    console.error("Initialization failed:", err);
    initialized = false;
  }
}

initializeApp().catch((err) => console.error(err));

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;