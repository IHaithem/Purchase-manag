"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/order.routes.ts
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const Auth_1 = require("../middlewares/Auth");
const Multer_1 = require("../middlewares/Multer");
const orderRouter = (0, express_1.Router)();
orderRouter.use(Auth_1.authenticate);
// Create order with optional bill upload
orderRouter.post("/", (0, Multer_1.upload)("orders").single("image"), order_controller_1.createOrder);
// Assign order to staff
orderRouter.post("/:orderId/assign", order_controller_1.assignOrder);
// Confirm order with bill upload and price
orderRouter.post("/:orderId/confirm", (0, Multer_1.upload)("orders").single("image"), order_controller_1.confirmOrder);
// Update order (for marking as paid)
orderRouter.put("/:orderId", (0, Multer_1.upload)("orders").single("image"), order_controller_1.updateOrder);
// Get filtered orders
orderRouter.get("/", order_controller_1.getOrdersByFilter);
// Get order statistics
orderRouter.get("/stats", order_controller_1.getOrderStats);
// Get order analytics
orderRouter.get("/analytics", order_controller_1.getOrderAnalytics);
// Get single order
orderRouter.get("/:orderId", order_controller_1.getOrder);
exports.default = orderRouter;
//# sourceMappingURL=order.router.js.map