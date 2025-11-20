import { Request, Response } from "express";
import Supplier from "../models/supplier.model";
import crypto from "crypto";
import { uploadBufferToBlob } from "../utils/blob";
import { deleteImage } from "../utils/Delete";
import { Types } from "mongoose";

/**
 * Normalize email field: treat empty string as undefined
 */
const normalizeEmail = (value: any): string | undefined => {
  if (!value) return undefined;
  const trimmed = String(value).trim();
  return trimmed === "" ? undefined : trimmed.toLowerCase();
};

/**
 * GET /api/suppliers
 */
export const getSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json({ suppliers });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * GET /api/suppliers/:supplierId
 */
export const getSupplierById = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplier = await Supplier.findById(req.params.supplierId);
    if (!supplier) {
      res.status(404).json({ message: "Supplier not found" });
      return;
    }
    res.status(200).json({ supplier });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * POST /api/suppliers
 * Email optional. Image optional.
 */
export const createSupplier = async (req: Request, res: Response): Promise<void> => {
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
      notes,
      isActive,
      categoryIds,
    } = req.body;

    if (!name || !contactPerson || !phone1 || !address) {
      res.status(400).json({ message: "Missing required fields: name, contactPerson, phone1, address" });
      return;
    }

    const normalizedEmail = normalizeEmail(email);

    if (normalizedEmail) {
      const existing = await Supplier.exists({ email: normalizedEmail });
      if (existing) {
        res.status(409).json({ message: "Email already in use" });
        return;
      }
    }

    let imageUrl: string | undefined;
    if (req.file) {
      const ext = (req.file.originalname.match(/\.[^/.]+$/) || [".bin"])[0];
      const key = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
      const uploaded = await uploadBufferToBlob(key, req.file.buffer, req.file.mimetype);
      imageUrl = uploaded.url;
    }

    try {
      const supplier = await Supplier.create({
        name,
        contactPerson,
        email: normalizedEmail,
        phone1,
        phone2: phone2 || undefined,
        phone3: phone3 || undefined,
        address,
        city: city || undefined,
        notes: notes || undefined,
        isActive: isActive !== undefined ? isActive : true,
        categoryIds: Array.isArray(categoryIds) ? categoryIds : [],
        image: imageUrl,
      });

      res.status(201).json({ message: "Supplier created successfully", supplier });
    } catch (err: any) {
      if (err.code === 11000 && err.keyPattern?.email) {
        res.status(409).json({ message: "Email already in use" });
        return;
      }
      throw err;
    }
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * PUT /api/suppliers/:supplierId
 * Supports removing email (removeEmail flag or blank)
 */
export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const {
      name,
      contactPerson,
      email,
      phone1,
      phone2,
      phone3,
      address,
      city,
      notes,
      isActive,
      categoryIds,
      removeEmail,
    } = req.body;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      res.status(404).json({ message: "Supplier not found" });
      return;
    }

    const normalizedEmail = normalizeEmail(email);

    // Handle email removal
    if (removeEmail === "true" || (!normalizedEmail && supplier.email)) {
      supplier.email = undefined;
    } else if (normalizedEmail && normalizedEmail !== supplier.email) {
      // Use exists to avoid full doc & fix TS unknown _id
      const existing = await Supplier.exists({ email: normalizedEmail });
      if (existing && existing._id.toString() !== supplierId) {
        res.status(409).json({ message: "Email already in use" });
        return;
      }
      supplier.email = normalizedEmail;
    }

    if (name) supplier.name = name;
    if (contactPerson) supplier.contactPerson = contactPerson;
    if (phone1) supplier.phone1 = phone1;
    supplier.phone2 = phone2 ? phone2 : undefined;
    supplier.phone3 = phone3 ? phone3 : undefined;
    if (address) supplier.address = address;
    supplier.city = city ? city : undefined;
    supplier.notes = notes ? notes : undefined;
    if (isActive !== undefined) supplier.isActive = isActive === "true" || isActive === true;

    if (categoryIds !== undefined) {
      supplier.categoryIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds].filter(Boolean);
    }

    if (req.file) {
      if (supplier.image && supplier.image.startsWith("/uploads/")) {
        try {
          deleteImage(supplier.image);
        } catch (e) {
          console.warn("Failed to delete legacy image:", e);
        }
      }
      const ext = (req.file.originalname.match(/\.[^/.]+$/) || [".bin"])[0];
      const key = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
      const uploaded = await uploadBufferToBlob(key, req.file.buffer, req.file.mimetype);
      supplier.image = uploaded.url;
    }

    try {
      await supplier.save();
    } catch (err: any) {
      if (err.code === 11000 && err.keyPattern?.email) {
        res.status(409).json({ message: "Email already in use" });
        return;
      }
      throw err;
    }

    res.status(200).json({ message: "Supplier updated successfully", supplier });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};