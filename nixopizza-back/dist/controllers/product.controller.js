"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.getOverStockProducts = exports.getLowStockProducts = exports.getProduct = exports.getAllProducts = exports.updateProduct = exports.createProduct = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const Delete_1 = require("../utils/Delete");
const createProduct = async (req, res) => {
    try {
        const { name, barcode, unit, categoryId, currentStock, minQty, recommendedQty, description } = req.body;
        if (!name || !unit || !categoryId || !currentStock || !minQty) {
            res.status(400).json({ message: "All fields must fill" });
            return;
        }
        const filename = req.file?.filename;
        if (!filename) {
            res.status(400).json({ message: "Product Must Have an Image" });
            return;
        }
        const newProduct = await product_model_1.default.create({
            name,
            barcode,
            unit,
            categoryId,
            currentStock,
            minQty,
            recommendedQty,
            description,
            imageUrl: `/uploads/products/${filename}`,
        });
        res
            .status(200)
            .json({ message: "Product created Successfully", product: newProduct });
    }
    catch (error) {
        console.error("Error : ", error);
        res
            .status(500)
            .json({ message: "Internal server error", err: error.message });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        console.log("Product Body : ", req.body);
        const { name, barcode, unit, categoryId, currentStock, minQty, recommendedQty, description } = req.body;
        console.log(name, barcode, unit, categoryId, currentStock, minQty, recommendedQty, description);
        console.log("Updated Product");
        const product = await product_model_1.default.findById(req.params.productId);
        if (!product) {
            res.status(404).json({ message: "Porduct not found" });
            return;
        }
        if (name)
            product.name = name;
        if (barcode)
            product.barcode = barcode;
        if (unit)
            product.unit = unit;
        if (categoryId)
            product.categoryId = categoryId;
        //TODO: should be handeled in the front and send it as a number not string
        if (currentStock) {
            product.currentStock = Number(currentStock);
        }
        //TODO: same here but 
        if (minQty)
            product.minQty = minQty;
        if (recommendedQty)
            product.recommendedQty = recommendedQty;
        if (description !== undefined)
            product.description = description;
        const filename = req.file?.filename;
        if (filename) {
            (0, Delete_1.deleteImage)(product.imageUrl);
            product.imageUrl = `/uploads/products/${filename}`;
        }
        await product.save();
        res.status(200).json({ message: "Product Updated Successfully", product });
    }
    catch (error) {
        console.error("Error : ", error);
        res
            .status(500)
            .json({ message: "Internal server error", err: error.message });
    }
};
exports.updateProduct = updateProduct;
const getAllProducts = async (req, res) => {
    try {
        const { name, categoryId, sortBy, order, page = 1, limit = 10 } = req.query;
        if (Number(page) < 1 || Number(limit) < 1) {
            res
                .status(400)
                .json({ message: "Page and limit must be greater than 0" });
            return;
        }
        const query = {};
        if (name) {
            query.$or = [
                { name: { $regex: name, $options: "i" } },
                { description: { $regex: name, $options: "i" } },
            ];
        }
        if (categoryId)
            query.categoryId = categoryId;
        const sortField = sortBy?.toString() || "createdAt";
        const sortOrder = order === "asc" ? 1 : -1;
        const skip = (Number(page) - 1) * Number(limit);
        const products = await product_model_1.default.find(query)
            .populate("categoryId")
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(Number(limit));
        const total = await product_model_1.default.countDocuments(query);
        res.status(200).json({
            total,
            pages: Math.ceil(total / Number(limit)),
            products,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Internal server error", err: error.message });
    }
};
exports.getAllProducts = getAllProducts;
const getProduct = async (req, res) => {
    try {
        const product = await product_model_1.default.findById(req.params.productId).populate("categoryId");
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.status(200).json({ product });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Internal server error", err: error.message });
    }
};
exports.getProduct = getProduct;
const getLowStockProducts = async (req, res) => {
    try {
        const { name, status } = req.query;
        // Base query
        const baseQuery = {};
        if (name) {
            baseQuery.name = { $regex: name, $options: "i" };
        }
        // Fetch ALL relevant products (below minQty or out of stock)
        const allProducts = await product_model_1.default.find({
            ...baseQuery,
            $or: [
                { currentStock: 0 },
                {
                    currentStock: { $gt: 0 },
                    $expr: { $lt: ["$currentStock", "$minQty"] },
                },
            ],
        }).populate("categoryId", "name");
        // Categorize
        const critical = [];
        const high = [];
        const medium = [];
        allProducts.forEach((p) => {
            if (p.currentStock === 0) {
                critical.push(p);
            }
            else if (p.currentStock < p.minQty / 2) {
                high.push(p);
            }
            else {
                medium.push(p);
            }
        });
        // Apply status filter AFTER categorization
        let finalCritical = critical;
        let finalHigh = high;
        let finalMedium = medium;
        if (status === "critical") {
            finalHigh = [];
            finalMedium = [];
        }
        else if (status === "high") {
            finalCritical = [];
            finalMedium = [];
        }
        else if (status === "medium") {
            finalCritical = [];
            finalHigh = [];
        }
        // else: return all
        const summary = {
            critical: critical.length,
            high: high.length,
            medium: medium.length,
            total: critical.length + high.length + medium.length,
        };
        res.status(200).json({
            success: true,
            summary,
            critical: finalCritical,
            high: finalHigh,
            medium: finalMedium,
        });
    }
    catch (error) {
        console.error("Low stock error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching stock data",
            error: error.message,
        });
    }
};
exports.getLowStockProducts = getLowStockProducts;
const getOverStockProducts = async (req, res) => {
    try {
        const overStock = await product_model_1.default.find({
            $expr: { $gte: ["$currentStock", "$recommendedQty"] },
        }).populate("categoryId", "name");
        res.status(200).json({
            success: true,
            count: overStock.length,
            products: overStock,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching overstock products",
            error,
        });
    }
};
exports.getOverStockProducts = getOverStockProducts;
const deleteProduct = async (req, res) => {
    try {
        const product = await product_model_1.default.findByIdAndDelete(req.params.productId);
        if (!product) {
            res.status(404).json({ message: "Porduct not found" });
            return;
        }
        (0, Delete_1.deleteImage)(product.imageUrl);
        res.status(200).json({ message: "Product Deleted Successfully" });
    }
    catch (error) {
        console.error("Error : ", error);
        res
            .status(500)
            .json({ message: "Internal server error", err: error.message });
    }
};
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=product.controller.js.map