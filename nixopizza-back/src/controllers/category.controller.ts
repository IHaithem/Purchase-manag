import { Request, Response } from "express";
import Category from "../models/category.model";
import { deleteImage } from "../utils/Delete";
import crypto from "crypto";
import { uploadBufferToBlob } from "../utils/blob";

/**
 * GET /api/categories
 * Optional query: name (regex match)
 */
export const getCategoriesByFilter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.query;

    const query: any = {};
    if (name) query.name = { $regex: name, $options: "i" };

    const categories = await Category.find(query).sort({ createdAt: -1 });
    res.status(200).json({ categories });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", err: error.message });
  }
};

/**
 * POST /api/categories
 * Fields: name (required), description (optional), image (optional)
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ message: "Name is required" });
      return;
    }

    if ((req as any).fileValidationError) {
      res.status(400).json({ message: (req as any).fileValidationError });
      return;
    }

    let imageUrl = "";
    if (req.file) {
      const ext = (req.file.originalname.match(/\.[^/.]+$/) || [".bin"])[0];
      const unique = crypto.randomBytes(8).toString("hex");
      const key = `${Date.now()}-${unique}${ext}`;
      const uploaded = await uploadBufferToBlob(key, req.file.buffer, req.file.mimetype);
      imageUrl = uploaded.url;
    }

    try {
      const newCategory = await Category.create({
        name,
        description,
        image: imageUrl,
      });

      res.status(201).json({
        message: "Category created successfully",
        category: newCategory,
      });
    } catch (err: any) {
      if (err.code === 11000 && err.keyPattern?.name) {
        res.status(409).json({ message: "Category name must be unique" });
        return;
      }
      throw err;
    }
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", err: error.message });
  }
};

/**
 * PUT /api/categories/:categoryId
 */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    if ((req as any).fileValidationError) {
      res.status(400).json({ message: (req as any).fileValidationError });
      return;
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;

    if (req.file) {
      if (category.image && category.image.startsWith("/uploads/")) {
        try {
          deleteImage(category.image);
        } catch (e) {
          console.warn("Failed to delete legacy image:", e);
        }
      }
      const ext = (req.file.originalname.match(/\.[^/.]+$/) || [".bin"])[0];
      const unique = crypto.randomBytes(8).toString("hex");
      const key = `${Date.now()}-${unique}${ext}`;
      const uploaded = await uploadBufferToBlob(key, req.file.buffer, req.file.mimetype);
      category.image = uploaded.url;
    }

    try {
      await category.save();
    } catch (err: any) {
      if (err.code === 11000 && err.keyPattern?.name) {
        res.status(409).json({ message: "Category name must be unique" });
        return;
      }
      throw err;
    }

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", err: error.message });
  }
};

/**
 * DELETE /api/categories/:categoryId
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    // Delete legacy disk file only (blob deletion not implemented yet)
    if (category.image && category.image.startsWith("/uploads/")) {
      try {
        deleteImage(category.image);
      } catch (e) {
        console.warn("Failed to delete legacy image:", e);
      }
    }

    res.status(200).json({
      message: "Category deleted successfully",
      category,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", err: error.message });
  }
};