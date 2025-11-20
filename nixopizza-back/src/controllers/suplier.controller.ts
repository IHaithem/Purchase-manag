import { Request, Response } from "express";
import Supplier from "../models/supplier.model";
import crypto from "crypto";
import { uploadBufferToBlob } from "../utils/blob";
import { deleteImage } from "../utils/Delete";

/**
 * Normalize email: empty -> undefined
 */
const normalizeEmail = (value: any): string | undefined => {
  if (!value) return undefined;
  const t = String(value).trim();
  return t === "" ? undefined : t.toLowerCase();
};

/**
 * GET /api/suppliers
 */
export const getSuppliers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json({ suppliers });
  } catch (e: any) {
    res.status(500).json({ message: "Internal server error", error: e.message });
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
  } catch (e: any) {
    res.status(500).json({ message: "Internal server error", error: e.message });
  }
};

/**
 * POST /api/suppliers
 * Email optional, duplicates allowed.
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

    let imageUrl: string | undefined;
    if (req.file) {
      const ext = (req.file.originalname.match(/\.[^/.]+$/) || [".bin"])[0];
      const key = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
      const uploaded = await uploadBufferToBlob(key, req.file.buffer, req.file.mimetype);
      imageUrl = uploaded.url;
    }

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
  } catch (e: any) {
    // No uniqueness conflict expected now
    res.status(500).json({ message: "Internal server error", error: e.message });
  }
};

/**
 * PUT /api/suppliers/:supplierId
 * Removing email (blank) sets it to undefined.
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

    if (removeEmail === "true" || (!normalizedEmail && supplier.email)) {
      supplier.email = undefined;
    } else if (normalizedEmail) {
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
      supplier.categoryIds = Array.isArray(categoryIds)
        ? categoryIds
        : [categoryIds].filter(Boolean);
    }

    if (req.file) {
      if (supplier.image && supplier.image.startsWith("/uploads/")) {
        try {
          deleteImage(supplier.image);
        } catch (err) {
          console.warn("Failed to delete legacy image:", err);
        }
      }
      const ext = (req.file.originalname.match(/\.[^/.]+$/) || [".bin"])[0];
      const key = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
      const uploaded = await uploadBufferToBlob(key, req.file.buffer, req.file.mimetype);
      supplier.image = uploaded.url;
    }

    await supplier.save();
    res.status(200).json({ message: "Supplier updated successfully", supplier });
  } catch (e: any) {
    res.status(500).json({ message: "Internal server error", error: e.message });
  }
};