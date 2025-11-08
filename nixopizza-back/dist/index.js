"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("./config/database"));
// routers
const auth_router_1 = __importDefault(require("./routes/auth.router"));
const product_router_1 = __importDefault(require("./routes/product.router"));
const category_router_1 = __importDefault(require("./routes/category.router"));
const order_router_1 = __importDefault(require("./routes/order.router"));
const admin_router_1 = __importDefault(require("./routes/admin.router"));
const expirationMonitoring_controller_1 = require("./controllers/expirationMonitoring.controller");
const user_model_1 = __importDefault(require("./models/user.model"));
const task_router_1 = __importDefault(require("./routes/task.router"));
const supplier_router_1 = __importDefault(require("./routes/supplier.router"));
const notification_router_1 = __importDefault(require("./routes/notification.router"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
const UPLOADS_DIR = path_1.default.resolve("src/uploads");
app.use("/uploads", express_1.default.static(UPLOADS_DIR));
const allowedOrigins = [
    process.env.CLIENT_ORIGIN ?? "",
    process.env.ADMIN_ORIGIN ?? "",
    process.env.PROD_CLIENT_ORIGIN ?? "https://<your-client>.vercel.app",
    process.env.PROD_ADMIN_ORIGIN ?? "https://<your-admin>.vercel.app",
];
app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
});
app.use("/api/auth", auth_router_1.default);
app.use("/api/admin", admin_router_1.default);
app.use("/api/products", product_router_1.default);
app.use("/api/orders", order_router_1.default);
app.use("/api/categories", category_router_1.default);
app.use("/api/tasks", task_router_1.default);
app.use("/api/suppliers", supplier_router_1.default);
app.use("/api/notifications", notification_router_1.default);
const PORT = process.env.PORT || 5000;
async function ensureAdmin() {
    const fullname = process.env.ADMIN_FULLNAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!fullname || !email || !password) {
        console.warn("⚠️ ADMIN_FULLNAME, ADMIN_EMAIL or ADMIN_PASSWORD not set in .env");
        return;
    }
    const existingAdmin = await user_model_1.default.findOne({ email, role: "admin" });
    if (existingAdmin) {
        console.log("✅ Admin already exists:", existingAdmin.email);
        return;
    }
    const admin = await user_model_1.default.create({
        fullname,
        email,
        password,
        role: "admin",
    });
    console.log("🚀 Admin created:", admin.email);
}
const startServer = async () => {
    try {
        await (0, database_1.default)();
        console.log("✅ Connected to MongoDB");
        // ensure admin exists
        await ensureAdmin();
        // Start cron jobs *after* DB is connected
        (0, expirationMonitoring_controller_1.initializeExpirationMonitoring)();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    }
    catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map