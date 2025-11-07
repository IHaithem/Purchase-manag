"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticate = void 0;
const Token_1 = require("../utils/Token");
const ACCESS_SECRET = process.env.ACCESS_SECRET || "default_secret_key";
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = (0, Token_1.verifyToken)(token, ACCESS_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
        return;
    }
};
exports.authenticate = authenticate;
const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        res.status(403).json({ message: "Admins only." });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=Auth.js.map