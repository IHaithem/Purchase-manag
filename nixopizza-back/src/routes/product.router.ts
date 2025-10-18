import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getLowStockProducts,
  getOverStockProducts,
  getProduct,
  updateProduct,
} from "../controllers/product.controller";
import { authenticate, requireAdmin } from "../middlewares/Auth";
import { upload } from "../middlewares/Multer";

const productRouter = Router();

productRouter.use(authenticate);

productRouter.post("/", upload("products").single("image"), createProduct);
productRouter.put(
  "/:productId",
  requireAdmin,
  upload("products").single("image"),
  updateProduct
);
productRouter.get("/", getAllProducts);
productRouter.get("/low", getLowStockProducts);
productRouter.get("/over", getOverStockProducts);
productRouter.get("/:productId", getProduct);
productRouter.delete("/:productId", deleteProduct);

export default productRouter;
