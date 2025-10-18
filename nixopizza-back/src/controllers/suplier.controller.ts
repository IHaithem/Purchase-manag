import { Request, Response } from "express";
import Supplier from "../models/supplier.model";
import { deleteImage } from "../utils/Delete";
import mongoose from "mongoose";

export const createSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, contactPerson, email, phone, address, categoryIds, notes } =
      req.body;

    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      res
        .status(400)
        .json({ message: "Supplier with this name already exists" });
      return;
    }
    const filename = req.file ? req.file.filename : undefined;

    const supplier = new Supplier({
      name,
      contactPerson,
      email,
      phone,
      address,
      notes,
      categoryIds,
      image: `/uploads/suppliers/${filename}`,
    });
    await supplier.save();

    res.status(201).json({ supplier });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getSuppliers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      page = 1,
      limit = 10,
      sortBy,
      order,
      status,
      categoryIds,
    } = req.query;

    const query: any = {};

    if (name) {
      query.name = { $regex: name.toString(), $options: "i" };
    }

    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;

    if (categoryIds) {
      let ids: string[] = [];

      if (Array.isArray(categoryIds)) {
        // If categoryIds is already an array
        ids = categoryIds.map((id) => id.toString());
      } else if (typeof categoryIds === "string") {
        // If categoryIds is a comma-separated string
        ids = categoryIds.split(",");
      }

      query.categoryIds = {
        $in: ids.map((id) => new mongoose.Types.ObjectId(id.trim())),
      };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortField = sortBy?.toString() || "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    const suppliers = await Supplier.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const total = await Supplier.countDocuments(query);

    res
      .status(200)
      .json({ suppliers, total, pages: Math.ceil(total / Number(limit)) });
  } catch (error: any) {
    console.error("Error in getSuppliers:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getSupplierById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      res.status(404).json({ message: "Supplier not found" });
      return;
    }
    res.status(200).json({ supplier });
  } catch (error: any) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const {
      name,
      address,
      contactPerson,
      email,
      phone,
      categoryIds,
      notes,
      isActive,
    } = req.body;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      res.status(404).json({ message: "Supplier not found" });
      return;
    }

    // Update supplier fields if provided in the request
    if (name) supplier.name = name;
    if (address) supplier.address = address;
    if (contactPerson) supplier.contactPerson = contactPerson;
    if (email) supplier.email = email;
    if (phone) supplier.phone = phone;
    if (categoryIds) supplier.categoryIds = categoryIds;
    if (notes) supplier.notes = notes;
    if (typeof isActive !== "undefined") supplier.isActive = isActive;

    // Handle image upload if present
    if (req.file) {
      deleteImage(supplier.image);
      supplier.image = `/uploads/suppliers/${req.file.filename}`;
    }

    await supplier.save();

    res.status(200).json({
      message: `Supplier ${supplier.name} updated successfully`,
      supplier,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
