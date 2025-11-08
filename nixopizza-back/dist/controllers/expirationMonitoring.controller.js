"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeExpirationMonitoring = exports.getCronStatus = exports.runImmediateCheck = exports.stopExpirationCron = exports.startExpirationCron = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const productOrder_controller_1 = require("./productOrder.controller");
let cronJob = null;
let isRunning = false;
const startExpirationCron = (timezone = "UTC") => {
    if (isRunning) {
        console.log("⚠️  Expiration cron job is already running");
        return;
    }
    try {
        console.log("🚀 Starting expiration cron job - daily at midnight");
        cronJob = node_cron_1.default.schedule("0 0 * * *", // Daily at midnight
        async () => {
            console.log(`⏰ Running expiration check at ${new Date().toISOString()}`);
            try {
                await (0, productOrder_controller_1.processExpiredProducts)();
                console.log("✅ Expiration check completed successfully");
            }
            catch (error) {
                console.error("❌ Error during expiration check:", error);
            }
        }, {
            scheduled: true,
            timezone,
        });
        isRunning = true;
        console.log("✅ Expiration cron job started successfully");
        // Run an initial check immediately
        (0, exports.runImmediateCheck)();
    }
    catch (error) {
        console.error("❌ Failed to start expiration cron job:", error);
    }
};
exports.startExpirationCron = startExpirationCron;
/**
 * Stop the expiration cron job
 */
const stopExpirationCron = () => {
    if (!isRunning || !cronJob) {
        console.log("⚠️  No expiration cron job is currently running");
        return;
    }
    try {
        cronJob.stop();
        cronJob = null;
        isRunning = false;
        console.log("🛑 Expiration cron job stopped successfully");
    }
    catch (error) {
        console.error("❌ Error stopping expiration cron job:", error);
    }
};
exports.stopExpirationCron = stopExpirationCron;
/**
 * Run an immediate expiration check (for testing or initial run)
 */
const runImmediateCheck = async () => {
    console.log("🔍 Running immediate expiration check...");
    try {
        await (0, productOrder_controller_1.processExpiredProducts)();
        console.log("✅ Immediate expiration check completed");
    }
    catch (error) {
        console.error("❌ Error during immediate expiration check:", error);
    }
};
exports.runImmediateCheck = runImmediateCheck;
const getCronStatus = () => {
    return { isRunning };
};
exports.getCronStatus = getCronStatus;
const initializeExpirationMonitoring = (timezone = "UTC") => {
    console.log("🔧 Initializing expiration monitoring system...");
    (0, exports.startExpirationCron)(timezone);
    process.on("SIGINT", () => {
        console.log("🛑 Gracefully shutting down expiration monitoring...");
        (0, exports.stopExpirationCron)();
        process.exit(0);
    });
    process.on("SIGTERM", () => {
        console.log("🛑 Gracefully shutting down expiration monitoring...");
        (0, exports.stopExpirationCron)();
        process.exit(0);
    });
};
exports.initializeExpirationMonitoring = initializeExpirationMonitoring;
(0, exports.initializeExpirationMonitoring)();
//# sourceMappingURL=expirationMonitoring.controller.js.map