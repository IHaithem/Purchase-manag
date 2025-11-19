import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConn: Promise<typeof mongoose> | undefined;
}

/**
 * Append dbName to an Atlas SRV URI if it has no path already.
 */
export function ensureDbInUri(uri: string, dbName: string | undefined): string {
  if (!uri) return uri;
  if (!dbName) return uri;

  const [base, qs] = uri.split("?");
  const marker = ".mongodb.net/";
  const idx = base.indexOf(marker);
  if (idx === -1) return uri; // Unexpected format.

  const after = base.substring(idx + marker.length);
  const hasPath = after.length > 0;
  if (hasPath) return uri; // Path already present.

  const newBase = base.endsWith("/") ? `${base}${dbName}` : `${base}/${dbName}`;
  return qs ? `${newBase}?${qs}` : newBase;
}

function redact(u: string) {
  return u.replace(/\/\/.*?:.*?@/, "//***:***@");
}

// --- Event listeners (attach once) ---
let listenersAttached = false;
function attachMongooseEventListeners() {
  if (listenersAttached) return;
  const conn = mongoose.connection;

  conn.on("connected", () => {
    console.log("🟢 [mongo] connected. readyState:", conn.readyState);
    try {
      const client = conn.getClient();
      // `options` can include maxPoolSize (Node driver)
      // Optional diagnostic only
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maxPoolSize = (client && (client as any).options?.maxPoolSize) || "unknown";
      console.log("🧪 [mongo] driver maxPoolSize:", maxPoolSize);
    } catch {
      /* ignore */
    }
  });
  conn.on("error", (err) => {
    console.error("🔴 [mongo] error:", err.name, err.message);
  });
  conn.on("disconnected", () => {
    console.warn("🟠 [mongo] disconnected. readyState:", conn.readyState);
  });
  conn.on("reconnected", () => {
    console.log("🟢 [mongo] reconnected. readyState:", conn.readyState);
  });

  listenersAttached = true;
}

// ---- Single attempt connect ----
async function connectOnce(finalUri: string, maxPoolSize: number, minPoolSize: number) {
  const serverSelectionTimeoutMS =
    Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 60000;
  const connectTimeoutMS =
    Number(process.env.MONGODB_CONNECT_TIMEOUT_MS) || 60000;
  const socketTimeoutMS =
    Number(process.env.MONGODB_SOCKET_TIMEOUT_MS) || 60000;

  return mongoose.connect(finalUri, {
    serverSelectionTimeoutMS,
    connectTimeoutMS,
    socketTimeoutMS,
    family: 4,
    maxPoolSize,
    minPoolSize,
    appName: "purchase-manag",
  });
}

/**
 * Retry wrapper with exponential backoff.
 */
async function connectWithRetry(finalUri: string, maxPoolSize: number, minPoolSize: number) {
  const attempts = Number(process.env.MONGODB_CONNECT_ATTEMPTS) || 5;
  const baseDelayMs = Number(process.env.MONGODB_CONNECT_BASE_DELAY_MS) || 500;
  let lastErr: any;

  for (let i = 1; i <= attempts; i++) {
    try {
      console.log(
        `🔌 [mongo] attempt ${i}/${attempts} uri=${redact(finalUri)} configuredMaxPoolSize=${maxPoolSize}`
      );
      const conn = await connectOnce(finalUri, maxPoolSize, minPoolSize);
      console.log("✅ [mongo] connected; readyState:", mongoose.connection.readyState);
      return conn;
    } catch (err: any) {
      lastErr = err;
      console.error(
        `❌ [mongo] attempt ${i} failed: ${err.name} - ${err.message}`
      );
      if (i < attempts) {
        const delay = baseDelayMs * Math.pow(2, i - 1);
        console.log(`⏳ [mongo] backoff ${delay}ms before retry`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  console.error("🛑 [mongo] all attempts failed.");
  throw lastErr;
}

export default async function connectDB() {
  attachMongooseEventListeners();

  // If already connected or connecting, reuse.
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  } else if (mongoose.connection.readyState === 2) {
    console.log("🔄 [mongo] already connecting; reusing existing state");
    return mongoose.connection;
  }

  if (global.__mongooseConn) {
    console.log("🔁 [mongo] using cached promise");
    return global.__mongooseConn;
  }

  const rawUri = (process.env.MONGODB_URI || process.env.MONGO_URI || "").trim();
  const dbName = (process.env.MONGODB_DB || "NEXO").trim();
  const maxPoolSize = Number(process.env.MONGODB_MAX_POOL_SIZE) || 5;
  const minPoolSize = Number(process.env.MONGODB_MIN_POOL_SIZE) || 0;

  console.log("🔍 [mongo] MONGODB_URI present:", !!rawUri);
  console.log("🔍 [mongo] DB name selected:", dbName);
  console.log("🔍 [mongo] pool config:", { maxPoolSize, minPoolSize });

  if (!rawUri) {
    throw new Error("MONGODB_URI (or MONGO_URI) missing");
  }

  const finalUri = ensureDbInUri(rawUri, dbName);
  console.log("🔐 [mongo] final URI:", redact(finalUri));

  const promise = connectWithRetry(finalUri, maxPoolSize, minPoolSize)
    .then((conn) => {
      console.log("🗄️ [mongo] using DB:", dbName);
      return conn;
    })
    .catch((err) => {
      console.error("❌ [mongo] final failure:", err.name, err.message);
      global.__mongooseConn = undefined;
      throw err;
    });

  global.__mongooseConn = promise;
  return promise;
}