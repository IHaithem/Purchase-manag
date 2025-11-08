"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoriesByFilter = void 0;
const category_model_1 = __importDefault(require("../models/category.model"));
const Delete_1 = require("../utils/Delete");
const getCategoriesByFilter = async (req, res) => {
    try {
        const { name } = req.query;
        const query = {};
        if (name)
            query.name = { $regex: name, $options: "i" }; // Fixed typo: $rgex -> $regex
        const categories = await category_model_1.default.find(query).sort({ createdAt: -1 });
        res.status(200).json({ categories });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Internal server error", err: error.message });
    }
};
exports.getCategoriesByFilter = getCategoriesByFilter;
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            res.status(400).json({ message: "All fields must fill" });
            return;
        }
        const filename = req.file?.filename;
        const newCategory = await category_model_1.default.create({
            name,
            description,
            image: `/uploads/categories/${filename}`,
        });
        res.status(200).json({
            message: "Category created Successfully",
            category: newCategory,
        });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "Internal server error", err: error.message });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const categoryId = req.params.categoryId;
        const category = await category_model_1.default.findById(categoryId);
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        if (name)
            category.name = name;
        if (description)
            category.description = description;
        const filename = req.file?.filename;
        if (filename) {
            (0, Delete_1.deleteImage)(category.image);
            category.image = `/uploads/categories/${filename}`;
        }
        await category.save();
        res.status(200).json({
            message: "Category updated Successfully",
            category,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Internal server error", err: error.message });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const category = await category_model_1.default.findByIdAndDelete(categoryId);
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        else {
            (0, Delete_1.deleteImage)(category.image);
        }
        res.status(200).json({
            message: "Category deleted Successfully",
            category,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Internal server error", err: error.message });
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=category.controller.js.map