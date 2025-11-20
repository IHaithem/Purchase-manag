import { Router } from "express";
import { authenticate } from "../middlewares/Auth";
import { upload } from "../middlewares/Multer";
import {
  createOrder,
  assignOrder,
  confirmOrder,
  updateOrder,
  getOrdersByFilter,
  getOrderStats,
  getOrderAnalytics,
} from "../controllers/order.controller";

const orderRouter = Router();

orderRouter.use(authenticate);

// Create order (optional bill image)
orderRouter.post("/", upload().single("image"), createOrder);

// Assign order
orderRouter.post("/:orderId/assign", assignOrder);

// Confirm order (preferred explicit endpoint)
orderRouter.post("/:orderId/confirm", upload().single("image"), confirmOrder);

// Update order (paid/canceled or alternative confirmation flow)
orderRouter.put("/:orderId", upload().single("image"), updateOrder);

// Stats (404 fix)
orderRouter.get("/stats", getOrderStats);

// Analytics (optional)
orderRouter.get("/analytics", getOrderAnalytics);

// Filtered fetch
orderRouter.get("/", getOrdersByFilter);

export default orderRouter;