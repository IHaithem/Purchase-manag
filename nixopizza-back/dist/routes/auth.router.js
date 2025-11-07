"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const Auth_1 = require("../middlewares/Auth");
const authRouter = (0, express_1.Router)();
authRouter.post("/login", auth_controller_1.login);
authRouter.post("/logout", auth_controller_1.logout);
authRouter.post("/refresh", auth_controller_1.refreshTokens);
authRouter.put("/profile", Auth_1.authenticate, auth_controller_1.updateUser);
exports.default = authRouter;
//# sourceMappingURL=auth.router.js.map