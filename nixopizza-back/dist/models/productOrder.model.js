"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const productOrderSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, "productId is Required"],
        ref: "Product",
    },
    quantity: {
        type: Number,
        required: [true, "Product Quantity is Required"],
    },
    expirationDate: {
        type: Date,
    },
    unitCost: {
        type: Number,
        required: [true, "Product Price is Required"],
    },
    remainingQte: {
        type: Number,
    },
    isExpired: {
        type: Boolean,
        default: false,
    },
    expiredQuantity: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
// Add index for efficient expiration queries
productOrderSchema.index({ expirationDate: 1, isExpired: 1 });
const ProductOrder = (0, mongoose_1.model)("ProductOrder", productOrderSchema);
exports.default = ProductOrder;
//# sourceMappingURL=productOrder.model.js.map