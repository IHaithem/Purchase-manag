import { Request, Response } from "express";
import Product from "../models/product.model";
import { deleteImage } from "../utils/Delete";
import crypto from "crypto";
import { uploadBufferToBlob } from "../utils/blob";

// CREATE
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      barcode,
      unit,
      categoryId,
      description,
      currentStock,
      minQty,
      recommendedQty,
    } = req.body;

    if (!name || !unit || !categoryId || currentStock === undefined || minQty === undefined) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    if ((req as any).fileValidationError) {
      res.status(400).json({ message: (req as any).fileValidationError });
      return;
    }

    let imageUrl: string | undefined;
    if (req.file) {
      const ext = (req.file.originalname.match(/\.[^/.]+$/) || [".bin"])[0];
      const unique = crypto.randomBytes(8).toString("hex");
      const key = `${Date.now()}-${unique}${ext}`;
      const uploaded = await uploadBufferToBlob(key, req.file.buffer, req.file.mimetype);
      imageUrl = uploaded.url;
    }

    try {
      const newProduct = await Product.create({
        name,
        barcode,
        unit,
        categoryId,
        description,
        currentStock: Number(currentStock),
        minQty: Number(minQty),
        recommendedQty: recommendedQty !== undefined ? Number(recommendedQty) : 0,
        imageUrl,
      });

      res.status(201).json({ message: "Product created successfully", product: newProduct });
    } catch (err: any) {
      if (err.code === 11000 && err.keyPattern?.name) {
        res.status(409).json({ message: "Product name must be unique" });
        return;
      }
      throw err;
    }
  } catch (error: any) {
    console.error("Product create error:", error);
    res.status(500).json({ message: "Internal server error", err: error.message });
  }
};

// UPDATE
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      barcode,
      unit,
      categoryId,
      description,
      currentStock,
      minQty,
      recommendedQty,
    } = req.body;

    const product = await Product.findById(req.params.productId);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    if ((req as any).fileValidationError) {
      res.status(400).json({ message: (req as any).fileValidationError });
      return;
    }

    if (name) product.name = name;
    if (barcode) product.barcode = barcode;
    if (unit) product.unit = unit;
    if (categoryId) product.categoryId = categoryId;
    if (description !== undefined) product.description = description;
    if (currentStock !== undefined) product.currentStock = Number(currentStock);
    if (minQty !== undefined) product.minQty = Number(minQty);
    if (recommendedQty !== undefined) product.recommendedQty = Number(recommendedQty);

    if (req.file) {
      if (product.imageUrl && product.imageUrl.startsWith("/uploads/")) {
        try {
          deleteImage(product.imageUrl);
        } catch (e) {
          console.warn("Failed to delete legacy product image:", e);
        }
      }
      const ext = (req.file.originalname.match(/\.[^/.]+$/) || [".bin"])[0];
      const unique = crypto.randomBytes(8).toString("hex");
      const key = `${Date.now()}-${unique}${ext}`;
      const uploaded = await uploadBufferToBlob(key, req.file.buffer, req.file.mimetype);
      product.imageUrl = uploaded.url;
    }

    try {
      await product.save();
    } catch (err: any) {
      if (err.code === 11000 && err.keyPattern?.name) {
        res.status(409).json({ message: "Product name must be unique" });
        return;
      }
      throw err;
    }

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error: any) {
    console.error("Product update error:", error);
    res.status(500).json({ message: "Internal server error", err: error.message });
  }
};

// GET ALL
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, categoryId, sortBy, order, page = 1, limit = 10 } = req.query;

    if (Number(page) < 1 || Number(limit) < 1) {
      res.status(400).json({ message: "Page and limit must be greater than 0" });
      return;
    }

    const query: any = {};
    if (name) {
      query.$or = [
        { name: { $regex: name, $options: "i" } },
        { description: { $regex: name, $options: "i" } },
        { barcode: { $regex: name, $options: "i" } },
      ];
    }
    if (categoryId) query.categoryId = categoryId;

    const sortField = sortBy?.toString() || "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;
    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .populate("categoryId")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      total,
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (error: any) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Internal server error", err: error.message });
  }
};

// GET SINGLE
export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.productId).populate("categoryId");
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.status(200).json({ product });
  } catch (error: any) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Internal server error", err: error.message });
  }
};

// DELETE
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    if (product.imageUrl && product.imageUrl.startsWith("/uploads/")) {
      try {
        deleteImage(product.imageUrl);
      } catch (e) {
        console.warn("Failed to delete legacy product image:", e);
      }
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Internal server error", err: error.message });
  }
};

// LOW STOCK
export const getLowStockProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({});
    const critical = products.filter(p => p.currentStock <= 0);
    const high = products.filter(p => p.currentStock > 0 && p.currentStock < p.minQty / 2);
    const medium = products.filter(
      p => p.currentStock >= p.minQty / 2 && p.currentStock < p.minQty
    );

    res.status(200).json({
      summary: {
        critical: critical.length,
        high: high.length,
        medium: medium.length,
        total: critical.length + high.length + medium.length,
      },
      critical,
      high,
      medium,
    });
  } catch (error: any) {
    console.error("Low stock error:", error);
    res.status(500).json({ message: "Internal server error", err: error.message });
  }
};

// OVER STOCK
export const getOverStockProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({});
    const over = products.filter(
      p => p.recommendedQty > 0 && p.currentStock > p.recommendedQty
    );
    res.status(200).json({ count: over.length, products: over });
  } catch (error: any) {
    console.error("Over stock error:", error);
    res.status(500).json({ message: "Internal server error", err: error.message });
  }
};