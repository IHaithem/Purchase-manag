import { Router } from "express";
import {
  createOrder,
  getOrder,
  getOrderAnalytics,
  getOrdersByFilter,
  getOrderStats,
  updateOrder,
} from "../controllers/order.controller";
import { authenticate } from "../middlewares/Auth";
import { upload } from "../middlewares/Multer";

const orderRouter = Router();

orderRouter.use(authenticate);

orderRouter.post("/", upload("orders").single("image"), createOrder);
orderRouter.put("/:orderId", upload("orders").single("image"), updateOrder);
orderRouter.get("/", getOrdersByFilter);
orderRouter.get("/stats", getOrderStats);
orderRouter.get("/analytics", getOrderAnalytics);
orderRouter.get("/:orderId", getOrder);

export default orderRouter;
