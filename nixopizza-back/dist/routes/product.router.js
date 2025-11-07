"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const Auth_1 = require("../middlewares/Auth");
const Multer_1 = require("../middlewares/Multer");
const productRouter = (0, express_1.Router)();
productRouter.use(Auth_1.authenticate);
productRouter.post("/", (0, Multer_1.upload)("products").single("image"), product_controller_1.createProduct);
productRouter.put("/:productId", Auth_1.requireAdmin, (0, Multer_1.upload)("products").single("image"), product_controller_1.updateProduct);
productRouter.get("/", product_controller_1.getAllProducts);
productRouter.get("/low", product_controller_1.getLowStockProducts);
productRouter.get("/over", product_controller_1.getOverStockProducts);
productRouter.get("/:productId", product_controller_1.getProduct);
productRouter.delete("/:productId", product_controller_1.deleteProduct);
exports.default = productRouter;
//# sourceMappingURL=product.router.js.map