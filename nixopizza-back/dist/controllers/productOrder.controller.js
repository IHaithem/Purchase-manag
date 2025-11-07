"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsExpiringSoon = exports.processExpiredProducts = exports.handleExpiredProduct = void 0;
const productOrder_model_1 = __importDefault(require("../models/productOrder.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const PushNotification_1 = require("../utils/PushNotification");
const handleExpiredProduct = async (product) => {
    try {
        const expiredQuantity = product.remainingQte;
        await productOrder_model_1.default.findByIdAndUpdate(product._id, {
            isExpired: true,
            expiredQuantity: expiredQuantity,
            remainingQte: 0,
        });
        await (0, PushNotification_1.pushNotification)(`Product Expired: ${product.productId}`, `Product with ID ${product.productId} has expired. Expired quantity: ${expiredQuantity}`, "expiry_warning", `${process.env.CLIENT_ORIGIN}/api/products/${product.productId}`);
        const updatedProduct = await product_model_1.default.findByIdAndUpdate(product._id, { $inc: { currentStock: -expiredQuantity } }, { new: true });
        if (!updatedProduct) {
            throw new Error(`Product with ID ${product._id} not found`);
        }
        await (0, PushNotification_1.pushNotification)(`Product Expired: ${updatedProduct.name}`, `Product ${updatedProduct.name} has expired. Expired quantity: ${expiredQuantity}`, "expiry_warning", `${process.env.CLIENT_ORIGIN}/api/products/${product.productId}`);
        if (updatedProduct?.currentStock < updatedProduct?.minQty) {
            await (0, PushNotification_1.pushNotification)(`${updatedProduct.name} Stock Alert`, `Product ${updatedProduct.name} is below minimum stock level! Current stock: ${updatedProduct.currentStock}`, "low_stock", `${process.env.CLIENT_ORIGIN}/api/products/${updatedProduct._id}`);
        }
        console.log(`Product ${product.productId} expired - Removed ${expiredQuantity} units`);
        //  Send notifications
    }
    catch (error) {
        console.error(`Error handling expired product ${product._id}:`, error);
    }
};
exports.handleExpiredProduct = handleExpiredProduct;
const processExpiredProducts = async () => {
    try {
        const now = new Date();
        const expiredProducts = await productOrder_model_1.default.find({
            expirationDate: { $lte: now },
            isExpired: false,
            remainingQte: { $gt: 0 },
        });
        console.log(`Found ${expiredProducts.length} expired products to process`);
        for (const product of expiredProducts) {
            await (0, exports.handleExpiredProduct)(product);
        }
    }
    catch (error) {
        console.error("Error processing expired products:", error);
    }
};
exports.processExpiredProducts = processExpiredProducts;
const getProductsExpiringSoon = async (req, res) => {
    try {
        const { daysAhead = 7 } = req.query;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + Number(daysAhead));
        const producstExpireSoon = await productOrder_model_1.default.find({
            expirationDate: {
                $lte: futureDate,
                $gt: new Date(),
            },
            isExpired: false,
            remainingQte: { $gt: 0 },
        }).populate("productId");
        res.status(200).json({ producstExpireSoon });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Internal server error", err: error.message });
    }
};
exports.getProductsExpiringSoon = getProductsExpiringSoon;
// Usage Examples:
// 1. Start the timer when your application starts
// ExpirationTimer.start(); // Runs every hour
// ExpirationTimer.start('*/30 * * * *'); // Runs every 30 minutes
// ExpirationTimer.start('0 0 * * *'); // Runs daily at midnight
// 2. Manual check
// const expiredCount = await ExpirationHandler.checkAndProcessExpired();
// 3. Get products expiring soon
// const expiringProducts = await ExpirationHandler.getProductsExpiringSoon(3); // 3 days ahead
// 4. Use middleware when querying products
// const product = await ProductOrder.findById(id);
// await checkExpirationMiddleware(product);
exports.default = productOrder_model_1.default;
//# sourceMappingURL=productOrder.controller.js.map