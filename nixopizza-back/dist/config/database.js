"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectDB() {
    if (global.__mongooseConn)
        return global.__mongooseConn;
    const uri = (process.env.MONGO_URI || "").trim();
    if (!uri) {
        throw new Error("MONGODB_URI (or MONGO_URI) is missing");
    }
    global.__mongooseConn = mongoose_1.default.connect(uri, {
        serverSelectionTimeoutMS: 8000,
    });
    return global.__mongooseConn;
}
//# sourceMappingURL=database.js.map