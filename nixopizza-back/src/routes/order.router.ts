import { Router } from "express";
import { authenticate } from "../middlewares/Auth";
import { upload } from "../middlewares/Multer";
import {
  createOrder,
  assignOrder,
  submitOrderForReview,
  verifyOrder,
  updateOrder,
  getOrdersByFilter,
  getOrderStats,
  getOrderAnalytics,
  legacyConfirmOrder,
} from "../controllers/order.controller";

const orderRouter = Router();
orderRouter.use(authenticate);

orderRouter.post("/", upload().single("image"), createOrder);
orderRouter.post("/:orderId/assign", assignOrder);

// New flow
orderRouter.post("/:orderId/review", upload().single("image"), submitOrderForReview);
orderRouter.post("/:orderId/verify", verifyOrder);

// Backward compatibility (old clients calling /confirm)
orderRouter.post("/:orderId/confirm", upload().single("image"), legacyConfirmOrder);

orderRouter.put("/:orderId", upload().single("image"), updateOrder);
orderRouter.get("/stats", getOrderStats);
orderRouter.get("/analytics", getOrderAnalytics);
orderRouter.get("/", getOrdersByFilter);

export default orderRouter;