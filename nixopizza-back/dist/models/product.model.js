"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Product Name Is Required"],
        trim: true,
    },
    barcode: {
        type: String,
        unique: false,
    },
    unit: {
        type: String,
        enum: ["liter", "kilogram", "box", "piece", "meter", "pack", "bottle"],
    },
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Product Category Is Required"],
    },
    imageUrl: {
        type: String,
        required: [true, "Product Image Is Required"],
    },
    currentStock: {
        type: Number,
        required: [true, "Product Stock Is Required"],
        default: 0,
    },
    minQty: {
        type: Number,
        default: 0,
    },
    recommendedQty: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
        default: "",
    },
}, {
    timestamps: true,
});
const Product = (0, mongoose_1.model)("Product", productSchema);
exports.default = Product;
//# sourceMappingURL=product.model.js.map