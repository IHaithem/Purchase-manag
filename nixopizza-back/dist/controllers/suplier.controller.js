"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSupplier = exports.getSupplierById = exports.getSuppliers = exports.createSupplier = void 0;
const supplier_model_1 = __importDefault(require("../models/supplier.model"));
const Delete_1 = require("../utils/Delete");
const mongoose_1 = __importDefault(require("mongoose"));
const createSupplier = async (req, res) => {
    try {
        const { name, contactPerson, email, phone1, phone2, phone3, city, address, categoryIds, notes } = req.body;
        const existingSupplier = await supplier_model_1.default.findOne({ email });
        if (existingSupplier) {
            res
                .status(400)
                .json({ message: "Supplier with this name already exists" });
            return;
        }
        const filename = req.file ? req.file.filename : undefined;
        const supplier = new supplier_model_1.default({
            name,
            contactPerson,
            email,
            phone1,
            phone2,
            phone3,
            city,
            address,
            notes,
            categoryIds,
            image: `/uploads/suppliers/${filename}`,
        });
        await supplier.save();
        res.status(201).json({ supplier });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
exports.createSupplier = createSupplier;
const getSuppliers = async (req, res) => {
    try {
        const { name, page = 1, limit = 10, sortBy, order, status, categoryIds, } = req.query;
        const query = {};
        if (name) {
            query.name = { $regex: name.toString(), $options: "i" };
        }
        if (status === "active")
            query.isActive = true;
        if (status === "inactive")
            query.isActive = false;
        if (categoryIds) {
            let ids = [];
            if (Array.isArray(categoryIds)) {
                // If categoryIds is already an array
                ids = categoryIds.map((id) => id.toString());
            }
            else if (typeof categoryIds === "string") {
                // If categoryIds is a comma-separated string
                ids = categoryIds.split(",");
            }
            query.categoryIds = {
                $in: ids.map((id) => new mongoose_1.default.Types.ObjectId(id.trim())),
            };
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sortField = sortBy?.toString() || "createdAt";
        const sortOrder = order === "asc" ? 1 : -1;
        const suppliers = await supplier_model_1.default.find(query)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(Number(limit));
        const total = await supplier_model_1.default.countDocuments(query);
        res
            .status(200)
            .json({ suppliers, total, pages: Math.ceil(total / Number(limit)) });
    }
    catch (error) {
        console.error("Error in getSuppliers:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
exports.getSuppliers = getSuppliers;
const getSupplierById = async (req, res) => {
    try {
        const { supplierId } = req.params;
        const supplier = await supplier_model_1.default.findById(supplierId);
        if (!supplier) {
            res.status(404).json({ message: "Supplier not found" });
            return;
        }
        res.status(200).json({ supplier });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
exports.getSupplierById = getSupplierById;
const updateSupplier = async (req, res) => {
    try {
        const { supplierId } = req.params;
        const { name, address, contactPerson, email, phone1, phone2, phone3, city, categoryIds, notes, isActive, } = req.body;
        const supplier = await supplier_model_1.default.findById(supplierId);
        if (!supplier) {
            res.status(404).json({ message: "Supplier not found" });
            return;
        }
        // Update supplier fields if provided in the request
        if (name)
            supplier.name = name;
        if (address)
            supplier.address = address;
        if (contactPerson)
            supplier.contactPerson = contactPerson;
        if (email)
            supplier.email = email;
        if (phone1)
            supplier.phone1 = phone1;
        if (phone2 !== undefined)
            supplier.phone2 = phone2;
        if (phone3 !== undefined)
            supplier.phone3 = phone3;
        if (city !== undefined)
            supplier.city = city;
        if (categoryIds)
            supplier.categoryIds = categoryIds;
        if (notes)
            supplier.notes = notes;
        if (typeof isActive !== "undefined")
            supplier.isActive = isActive;
        // Handle image upload if present
        if (req.file) {
            (0, Delete_1.deleteImage)(supplier.image);
            supplier.image = `/uploads/suppliers/${req.file.filename}`;
        }
        await supplier.save();
        res.status(200).json({
            message: `Supplier ${supplier.name} updated successfully`,
            supplier,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
    }
};
exports.updateSupplier = updateSupplier;
//# sourceMappingURL=suplier.controller.js.map