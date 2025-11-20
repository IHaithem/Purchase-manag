import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/Auth";
import {
  createSupplier,
  getSupplierById,
  getSuppliers,
  updateSupplier,
} from "../controllers/suplier.controller";
import { upload } from "../middlewares/Multer";

const supplierRouter = Router();

supplierRouter.use(authenticate);

supplierRouter.post("/", requireAdmin, upload().single("image"), createSupplier);
supplierRouter.get("/", getSuppliers);
supplierRouter.get("/:supplierId", getSupplierById);
supplierRouter.put("/:supplierId", requireAdmin, upload().single("image"), updateSupplier);

export default supplierRouter;