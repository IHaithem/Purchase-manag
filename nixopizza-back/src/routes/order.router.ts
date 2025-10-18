// routes/order.routes.ts
import { Router } from "express";
import {
  createOrder,
  getOrder,
  getOrderAnalytics,
  getOrdersByFilter,
  getOrderStats,
  updateOrder,
  assignOrder,
  confirmOrder,
} from "../controllers/order.controller";
import { authenticate } from "../middlewares/Auth";
import { upload } from "../middlewares/Multer";

const orderRouter = Router();

orderRouter.use(authenticate);

// Create order with optional bill upload
orderRouter.post("/", upload("orders").single("image"), createOrder);

// Assign order to staff
orderRouter.post("/:orderId/assign", assignOrder);

// Confirm order with bill upload and price
orderRouter.post("/:orderId/confirm", upload("orders").single("image"), confirmOrder);

// Update order (for marking as paid)
orderRouter.put("/:orderId", upload("orders").single("image"), updateOrder);

// Get filtered orders
orderRouter.get("/", getOrdersByFilter);

// Get order statistics
orderRouter.get("/stats", getOrderStats);

// Get order analytics
orderRouter.get("/analytics", getOrderAnalytics);

// Get single order
orderRouter.get("/:orderId", getOrder);

export default orderRouter;