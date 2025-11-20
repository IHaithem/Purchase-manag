import { Request, Response } from "express";
import Supplier from "../models/supplier.model";
import { deleteImage } from "../utils/Delete";
import mongoose from "mongoose";
import crypto from "crypto";
import { uploadBufferToBlob } from "../utils/blob";

const buildBlobKey = (originalName: string) => {
  const ext = (originalName.match(/\.[^/.]+$/) || [".bin"])[0];
  const unique = crypto.randomBytes(8).toString("hex");
  return `${Date.now()}-${unique}${ext}`;
};

export const createSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      contactPerson,
      email,
      phone1,
      phone2,
      phone3,
      address,
      city,
      categoryIds,
      notes,
      isActive,
    } = req.body;

    if (!name || !contactPerson || !email || !phone1 || !address) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      res.status(409).json({ message: "Supplier with this email already exists" });
      return;
    }

    let imageUrl: string | undefined;
    if (req.file) {
      const key = buildBlobKey(req.file.originalname);
      const uploaded = await uploadBufferToBlob(key, req.file.buffer, req.file.mimetype);
      imageUrl = uploaded.url;
    }

    const supplier = new Supplier({
      name,
      contactPerson,
      email,
      phone1,
      phone2,
      phone3,
      address,
      city,
      notes,
      categoryIds,
      isActive: isActive === "false" ? false : true,
      image: imageUrl,
    });

    await supplier.save();
    res.status(201).json({ supplier });
  } catch (error: any) {
    console.error("createSupplier error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
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
        ids = categoryIds.map((id) => id.toString());
      } else if (typeof categoryIds === "string") {
        ids = categoryIds.split(",");
      }
      query.categoryIds = {
        $in: ids
          .map((id) => id.trim())
          .filter((id) => id.length > 0)
          .map((id) => new mongoose.Types.ObjectId(id)),
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

    res.status(200).json({
      suppliers,
      total,
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error: any) {
    console.error("getSuppliers error:", error);
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
      city,
      contactPerson,
      email,
      phone1,
      phone2,
      phone3,
      categoryIds,
      notes,
      isActive,
    } = req.body;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      res.status(404).json({ message: "Supplier not found" });
      return;
    }

    if (name) supplier.name = name;
    if (address) supplier.address = address;
    if (city !== undefined) supplier.city = city;
    if (contactPerson) supplier.contactPerson = contactPerson;
    if (email) supplier.email = email;
    if (phone1 !== undefined) supplier.phone1 = phone1;
    if (phone2 !== undefined) supplier.phone2 = phone2;
    if (phone3 !== undefined) supplier.phone3 = phone3;
    if (categoryIds) supplier.categoryIds = Array.isArray(categoryIds)
      ? categoryIds
      : [categoryIds];
    if (notes !== undefined) supplier.notes = notes;
    if (typeof isActive !== "undefined") {
      supplier.isActive = isActive === "false" ? false : isActive === "true" ? true : !!isActive;
    }

    if (req.file) {
      if (supplier.image && supplier.image.startsWith("/uploads/")) {
        try {
          deleteImage(supplier.image);
        } catch (e) {
          console.warn("Failed to delete legacy supplier image:", e);
        }
      }
      const key = buildBlobKey(req.file.originalname);
      const uploaded = await uploadBufferToBlob(key, req.file.buffer, req.file.mimetype);
      supplier.image = uploaded.url;
    }

    await supplier.save();

    res.status(200).json({
      message: `Supplier ${supplier.name} updated successfully`,
      supplier,
    });
  } catch (error: any) {
    console.error("updateSupplier error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};