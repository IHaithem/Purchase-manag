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

productRouter.post("/", upload().single("image"), createProduct);
productRouter.put("/:productId", requireAdmin, upload().single("image"), updateProduct);
productRouter.get("/", getAllProducts);
productRouter.get("/low", getLowStockProducts);      // unchanged (not in shown snippet)
productRouter.get("/over", getOverStockProducts);    // unchanged
productRouter.get("/:productId", getProduct);
productRouter.delete("/:productId", deleteProduct);

export default productRouter;