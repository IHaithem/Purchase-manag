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

import blobUploadRouter from "./routes/blobUpload.router";


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
  // production vars
  normalizeOrigin(process.env.PROD_CLIENT_ORIGIN),
  normalizeOrigin(process.env.PROD_ADMIN_ORIGIN),

  // new per-branch explicit vars (you will set these as Preview overrides in Vercel)
  normalizeOrigin(process.env.STAG_CLIENT_ORIGIN),
  normalizeOrigin(process.env.STAG_ADMIN_ORIGIN),
  normalizeOrigin(process.env.DEV_CLIENT_ORIGIN),
  normalizeOrigin(process.env.DEV_ADMIN_ORIGIN),

  // legacy/backwards compatibility
  normalizeOrigin(process.env.CLIENT_ORIGIN),
  normalizeOrigin(process.env.ADMIN_ORIGIN),
  normalizeOrigin(process.env.PROD_CLIENT_ORIGIN),
  normalizeOrigin(process.env.PROD_ADMIN_ORIGIN),
].filter(Boolean) as string[]; // keep only non-empty

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

// More permissive preview fallback (disabled by default)
// You can set ENABLE_PERMISSIVE_PREVIEW=1 to activate it.
const permissivePreviewRegex =
  /purchase-manag-front-[a-z0-9-]+-haithem-fellahs-projects\.vercel\.app$/;

// Diagnostic helper
function debugCors(origin: string, hostname: string, isExactAllowed: boolean, isPreviewAllowed: boolean, isPermissive: boolean) {
  console.log("CORS check:", {
    origin,
    hostname,
    isExactAllowed,
    isPreviewAllowed,
    isPermissive,
    exactAllowedHostnames,
    regex: previewFrontendHostnameRegex.source,
    permissiveRegex: permissivePreviewRegex.source,
  });
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        console.log("CORS: no origin header -> allow");
        return callback(null, true);
      }
      let hostname: string;
      try {
        hostname = new URL(origin).hostname;
      } catch (e) {
        console.warn("CORS invalid origin header:", origin, (e as any).message);
        return callback(new Error("Invalid origin"));
      }

      const isExactAllowed = exactAllowedHostnames.includes(hostname);
      const isPreviewAllowed = previewFrontendHostnameRegex.test(hostname);
      const isPermissive =
        process.env.ENABLE_PERMISSIVE_PREVIEW === "1" &&
        permissivePreviewRegex.test(hostname);

      debugCors(origin, hostname, isExactAllowed, isPreviewAllowed, isPermissive);

      if (isExactAllowed || isPreviewAllowed || isPermissive) {
        return callback(null, true);
      }

      console.warn("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
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
 * CORS debug endpoint
 * Returns arrays & test results so you can inspect what backend thinks is allowed.
 * Optional query param ?testOrigin=https://some-origin
 */
app.get("/api/debug-cors", (req: Request, res: Response) => {
  const testOrigin = (req.query.testOrigin as string) || "";
  let testHostname = "";
  let parseError = "";
  if (testOrigin) {
    try {
      testHostname = new URL(testOrigin).hostname;
    } catch (e: any) {
      parseError = e.message;
    }
  }

  const result =
    testHostname &&
    parseError === "" ? {
      testOrigin,
      testHostname,
      isExactAllowed: exactAllowedHostnames.includes(testHostname),
      isPreviewAllowed: previewFrontendHostnameRegex.test(testHostname),
      isPermissive: permissivePreviewRegex.test(testHostname),
      enabledPermissive: process.env.ENABLE_PERMISSIVE_PREVIEW === "1",
    } : null;

  res.json({
    exactAllowedOrigins,
    exactAllowedHostnames,
    previewRegex: previewFrontendHostnameRegex.source,
    permissiveRegex: permissivePreviewRegex.source,
    ENABLE_PERMISSIVE_PREVIEW: process.env.ENABLE_PERMISSIVE_PREVIEW || "",
    test: result,
    parseError,
  });
});

/**
 * Improved database debug endpoint
 */
app.get("/api/debug-db", (_req: Request, res: Response) => {
  try {
    const rawUri = (process.env.MONGODB_URI || process.env.MONGO_URI || "").trim();
    const dbEnv = (process.env.MONGODB_DB || "").trim();
    const finalUri = ensureDbInUri(rawUri, dbEnv || undefined);

    const rawHasPath = /^mongodb\+srv:\/\/[^/]+\/[^?]+/.test(rawUri);
    const finalHasPath = /^mongodb\+srv:\/\/[^/]+\/[^?]+/.test(finalUri);

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

    const redact = (u: string) => u.replace(/\/\/.*?:.*?@/, "//***:***@");
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
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

    console.log("🔐 ensureAdmin vars:", {
      hasFullname: !!fullname,
      hasEmail: !!email,
      hasPassword: !!password,
      emailValue: email,
    });

    if (!fullname || !email || !password) {
      console.warn("⚠️ ADMIN_* missing; skipping seed");
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
  } catch (e: any) {
    console.error("❌ ensureAdmin error:", e.name, e.message);
  }
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