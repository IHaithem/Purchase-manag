"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Auth_1 = require("../middlewares/Auth");
const suplier_controller_1 = require("../controllers/suplier.controller");
const Multer_1 = require("../middlewares/Multer");
const supplierRouter = (0, express_1.Router)();
supplierRouter.use(Auth_1.authenticate);
supplierRouter.post("/", Auth_1.requireAdmin, (0, Multer_1.upload)("suppliers").single("image"), suplier_controller_1.createSupplier);
supplierRouter.get("/", suplier_controller_1.getSuppliers);
supplierRouter.get("/:supplierId", suplier_controller_1.getSupplierById);
supplierRouter.put("/:supplierId", Auth_1.requireAdmin, (0, Multer_1.upload)("suppliers").single("image"), suplier_controller_1.updateSupplier);
exports.default = supplierRouter;
//# sourceMappingURL=supplier.router.js.map