"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const generateTokens = (userId, isAdmin, res) => {
    const access_secret = process.env.ACCESS_SECRET || "default_secret_key";
    const refresh_secret = process.env.REFRESH_SECRET || "default_secret_key";
    const accessToken = jsonwebtoken_1.default.sign({ userId, isAdmin }, access_secret, {
        expiresIn: "15m",
    });
    const refreshToken = jsonwebtoken_1.default.sign({ userId, isAdmin }, refresh_secret, {
        expiresIn: "7d",
    });
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return accessToken;
};
exports.generateTokens = generateTokens;
const verifyToken = (token, secret) => {
    try {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        throw new Error("Invalid token");
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=Token.js.map