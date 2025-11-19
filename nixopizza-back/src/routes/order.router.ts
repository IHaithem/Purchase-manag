import { Router } from "express";
import { authenticate } from "../middlewares/Auth";
import { upload } from "../middlewares/Multer";
import {
  createOrder,
  assignOrder,
  confirmOrder,
  updateOrder,
  getOrdersByFilter,
} from "../controllers/order.controller";

const orderRouter = Router();

orderRouter.use(authenticate);

// Create order with optional image
orderRouter.post("/", upload().single("image"), createOrder);

// Assign order to staff
orderRouter.post("/:orderId/assign", assignOrder);

// Confirm order with bill upload and price
orderRouter.post("/:orderId/confirm", upload().single("image"), confirmOrder);

// Update order (marking as paid etc.)
orderRouter.put("/:orderId", upload().single("image"), updateOrder);

// Get filtered orders
orderRouter.get("/", getOrdersByFilter);

export default orderRouter;