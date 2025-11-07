"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Auth_1 = require("../middlewares/Auth");
const notification_controller_1 = require("../controllers/notification.controller");
const notificationRouter = (0, express_1.Router)();
notificationRouter.use(Auth_1.authenticate);
notificationRouter.use(Auth_1.requireAdmin);
notificationRouter.get("/", notification_controller_1.getNotifications);
notificationRouter.put("/", notification_controller_1.readAllNotifications);
notificationRouter.put("/:notificationId", notification_controller_1.readNotification);
exports.default = notificationRouter;
//# sourceMappingURL=notification.router.js.map