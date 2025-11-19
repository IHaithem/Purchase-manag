import express, { Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import bcrypt from "bcryptjs";
import connectDB, { ensureDbInUri } from "./config/database";

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

// Only load .env in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const UPLOADS_DIR = path.resolve("src/uploads");
app.use("/uploads", express.static(UPLOADS_DIR));

/**
 * CORS
 * - Allow exact origins from env (no trailing slash)
 * - Also allow Vercel preview URLs for this frontend project:
 *   purchase-manag-front-<anything>-haithem-fellahs-projects.vercel.app
 */
function normalizeOrigin(o?: string) {
  if (!o) return "";
  return o.trim().replace(/\/+$/, "");
}

const exactAllowedOrigins = [
  normalizeOrigin(process.env.CLIENT_ORIGIN),        // e.g. http://localhost:3000
  normalizeOrigin(process.env.ADMIN_ORIGIN),         // e.g. http://localhost:3000
  normalizeOrigin(process.env.PROD_CLIENT_ORIGIN),   // e.g. https://purchase-manag-front.vercel.app
  normalizeOrigin(process.env.PROD_ADMIN_ORIGIN),    // e.g. https://purchase-manag-front.vercel.app
].filter(Boolean) as string[];

const exactAllowedHostnames = exactAllowedOrigins
  .map((o) => {
    try {
      return new URL(o).hostname;
    } catch {
      return "";
    }
  })
  .filter(Boolean);

const previewFrontendHostnameRegex =
  /^purchase-manag-front-[a-z0-9-]+-haithem-fellahs-projects\.vercel\.app$/;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true); // same-origin/non-browser
      try {
        const { hostname } = new URL(origin);

        const isExactAllowed = exactAllowedHostnames.includes(hostname);
        const isPreviewAllowed = previewFrontendHostnameRegex.test(hostname);

        if (isExactAllowed || isPreviewAllowed) {
          return callback(null, true);
        }

        console.warn("CORS blocked origin:", origin);
        return callback(new Error("Not allowed by CORS"));
      } catch {
        console.warn("CORS invalid origin:", origin);
        return callback(new Error("Invalid origin"));
      }
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Health/debug
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

/**
 * Improved database debug endpoint
 * Shows raw URI (redacted), final URI path decision, chosen DB name, Mongoose state.
 */
app.get("/api/debug-db", (_req: Request, res: Response) => {
  try {
    const rawUri = (process.env.MONGODB_URI || process.env.MONGO_URI || "").trim();
    const dbEnv = (process.env.MONGODB_DB || "").trim();
    const finalUri = ensureDbInUri(rawUri, dbEnv || undefined);

    // Detect if the raw URI already had a path component before adding dbEnv
    const rawHasPath = /^mongodb\+srv:\/\/[^/]+\/[^?]+/.test(rawUri);
    const finalHasPath = /^mongodb\+srv:\/\/[^/]+\/[^?]+/.test(finalUri);

    // Mongoose readyState -> human
    const rs = require("mongoose").connection.readyState;
    const rsText =
      rs === 0
        ? "disconnected"
        : rs === 1
        ? "connected"
        : rs === 2
        ? "connecting"
        : rs === 3
        ? "disconnecting"
        : "unknown";

    // Redact credentials in both URIs
    const redact = (u: string) => u.replace(/\/\/.*?:.*?@/, "//***:***@");

    res.json({
      hasMongoDBUri: !!process.env.MONGODB_URI,
      rawUriLength: rawUri.length,
      rawUriStart: rawUri.substring(0, 40),
      rawUriEnd: rawUri.substring(rawUri.length - 40),
      rawHasPath,
      dbEnvValue: dbEnv,
      finalUriStart: finalUri.substring(0, 40),
      finalUriEnd: finalUri.substring(finalUri.length - 40),
      finalHasPath,
      hasDatabaseName: !!dbEnv,
      mongooseState: rs,
      mongooseStateText: rsText,
      nodeEnv: process.env.NODE_ENV,
      redactedRawUri: redact(rawUri),
      redactedFinalUri: redact(finalUri),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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
    console.warn("⚠️ ADMIN_* vars not set — skipping admin seed");
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
    console.log("MONGODB_DB value:", process.env.MONGODB_DB);

    console.log("🔌 Connecting to MongoDB...");
    await connectDB();

    console.log("👤 Ensuring admin user...");
    await ensureAdmin();

    console.log("📊 Initializing expiration monitoring...");
    initializeExpirationMonitoring();

    isInitialized = true;
    console.log("✅ App initialization complete!");
  } catch (err) {
    console.error("❌ Failed to initialize app:", err);
    isInitialized = false;
  }
};

initializeApp().catch((err) => {
  console.error("❌ Initialization error:", err);
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;