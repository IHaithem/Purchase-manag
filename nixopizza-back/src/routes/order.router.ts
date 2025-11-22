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
  getOrder,
} from "../controllers/order.controller";

const orderRouter = Router();
orderRouter.use(authenticate);

orderRouter.post("/", upload().single("image"), createOrder);
orderRouter.post("/:orderId/assign", assignOrder);
orderRouter.post("/:orderId/review", upload().single("image"), submitOrderForReview);
orderRouter.post("/:orderId/verify", verifyOrder);
orderRouter.put("/:orderId", upload().single("image"), updateOrder);
orderRouter.get("/stats", getOrderStats);
orderRouter.get("/analytics", getOrderAnalytics);
orderRouter.get("/:orderId", getOrder);
orderRouter.get("/", getOrdersByFilter);

export default orderRouter;