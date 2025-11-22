// controllers/order.controller.ts (confirmed fully removed)
import { Request, Response } from "express";
import Product from "../models/product.model";
import Order from "../models/order.model";
import ProductOrder from "./productOrder.controller";
import { deleteImage } from "../utils/Delete";
import crypto from "crypto";
import { uploadBufferToBlob } from "../utils/blob";

const generateOrderNumber = () => {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${date}-${rand}`;
};

const buildBlobKey = (originalName: string) => {
  const ext = (originalName.match(/\.[^/.]+$/) || [".bin"])[0];
  const unique = crypto.randomBytes(8).toString("hex");
  return `${Date.now()}-${unique}${ext}`;
};

async function populateOrder(orderDoc: any) {
  if (!orderDoc) return orderDoc;
  return await orderDoc
    .populate([
      { path: "staffId", select: "avatar email fullname" },
      {
        path: "supplierId",
        select:
          "email name image contactPerson address phone1 phone2 phone3 city",
      },
      {
        path: "items",
        populate: {
          path: "productId",
          select: "name currentStock imageUrl barcode",
        },
      },
    ])
    .execPopulate?.();
}

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      items,
      supplierId,
      notes,
      expectedDate,
    }: {
      items: { productId: string; quantity: number; unitCost: number; expirationDate: Date }[];
      supplierId: string;
      notes: string;
      expectedDate?: Date;
    } = req.body;

    if (!supplierId || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: "supplierId and items are required" });
      return;
    }

    const productOrdersPromises = items.map(
      async ({ productId, quantity, unitCost, expirationDate }) => {
        const product = await Product.findById(productId);
        if (!product) throw new Error("Product not found");
        const productOrder = await ProductOrder.create({
          productId,
            quantity,
            unitCost,
            expirationDate,
            remainingQte: quantity,
        });
        await productOrder.save();
        return productOrder._id;
      }
    );

    const productOrders = await Promise.all(productOrdersPromises);

    const totalAmount = items.reduce(
      (sum, item) => sum + item.unitCost * item.quantity,
      0
    );

    const order = new Order({
      items: productOrders,
      supplierId,
      status: "not assigned",
      totalAmount,
      notes,
      expectedDate,
      orderNumber: generateOrderNumber(),
    });

    if (req.file) {
      const key = buildBlobKey(req.file.originalname);
      const uploaded = await uploadBufferToBlob(
        key,
        req.file.buffer,
        req.file.mimetype
      );
      order.bon = uploaded.url;
    }

    await order.save();
    const populated = await populateOrder(order);
    res
      .status(201)
      .json({ message: "Order created successfully", order: populated || order });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const assignOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.orderId;
    const { staffId } = req.body;
    if (!staffId) {
      res.status(400).json({ message: "Staff ID is required" });
      return;
    }
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    if (order.status !== "not assigned") {
      res.status(400).json({ message: "Order is already assigned or progressed" });
      return;
    }
    order.staffId = staffId;
    order.status = "assigned";
    order.assignedDate = new Date();
    await order.save();
    const populated = await populateOrder(order);
    res.status(200).json({ message: "Order assigned successfully", order: populated || order });
  } catch (error: any) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Step 1: assigned -> pending_review
export const submitOrderForReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.orderId;
    const { totalAmount } = req.body;
    const order = await Order.findById(orderId).populate({
      path: "items",
      populate: { path: "productId" },
    });
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    if (order.status !== "assigned") {
      res.status(400).json({ message: "Order must be assigned first" });
      return;
    }
    if (!req.file) {
      res.status(400).json({ message: "Bill file required" });
      return;
    }

    if (order.bon && order.bon.startsWith("/uploads/orders/")) {
      try { deleteImage(order.bon); } catch {}
    }
    const key = buildBlobKey(req.file.originalname);
    const uploaded = await uploadBufferToBlob(
      key,
      req.file.buffer,
      req.file.mimetype
    );
    order.bon = uploaded.url;

    if (totalAmount) {
      order.totalAmount = parseFloat(totalAmount);
    }

    order.status = "pending_review";
    order.pendingReviewDate = new Date();

    await order.save();
    const populated = await populateOrder(order);
    res
      .status(200)
      .json({ message: "Order submitted for review", order: populated || order });
  } catch (error: any) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Step 2: pending_review -> verified (inventory updated now)
export const verifyOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).populate({
      path: "items",
      populate: { path: "productId" },
    });
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    if (order.status !== "pending_review") {
      res.status(400).json({ message: "Order must be pending_review to verify" });
      return;
    }
    if (!order.bon) {
      res.status(400).json({ message: "Bill missing" });
      return;
    }

    for (const itemId of order.items) {
      const productOrder: any = await ProductOrder.findById(itemId);
      if (productOrder) {
        const product = await Product.findById(productOrder.productId);
        if (product) {
          product.currentStock += productOrder.quantity;
          await product.save();
        }
      }
    }

    order.status = "verified";
    order.verifiedDate = new Date();

    await order.save();
    const populated = await populateOrder(order);
    res
      .status(200)
      .json({ message: "Order verified successfully", order: populated || order });
  } catch (error: any) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.orderId;
    const { status, expectedDate, canceledDate, totalAmount } = req.body;

    const validStatuses = [
      "not assigned",
      "assigned",
      "pending_review",
      "verified",
      "paid",
      "canceled",
    ];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({
        message: `Invalid status. Use one of: ${validStatuses.join(", ")}`,
      });
      return;
    }

    const order = await Order.findById(orderId).populate({
      path: "items",
      populate: { path: "productId" },
    });
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    if (status === "paid") {
      if (order.status !== "verified") {
        res.status(400).json({ message: "Order must be verified before paid" });
        return;
      }
      order.status = "paid";
      order.paidDate = new Date();
    } else if (status === "canceled") {
      order.status = "canceled";
      order.canceledDate = canceledDate ? new Date(canceledDate) : new Date();
    } else if (status && status !== order.status) {
      // Allow simple forward transitions (e.g., not assigned -> assigned)
      order.status = status;
      if (status === "assigned") order.assignedDate = new Date();
      if (status === "pending_review") order.pendingReviewDate = new Date();
      if (status === "verified") order.verifiedDate = new Date();
    }

    if (expectedDate !== undefined) {
      order.expectedDate = expectedDate ? new Date(expectedDate) : undefined;
    }

    if (req.file) {
      if (order.bon && order.bon.startsWith("/uploads/orders/")) {
        try { deleteImage(order.bon); } catch {}
      }
      const key = buildBlobKey(req.file.originalname);
      const uploaded = await uploadBufferToBlob(
        key,
        req.file.buffer,
        req.file.mimetype
      );
      order.bon = uploaded.url;
    }

    if (totalAmount) {
      order.totalAmount = parseFloat(totalAmount);
    }

    await order.save();
    const populated = await populateOrder(order);
    res
      .status(200)
      .json({ message: "Order updated successfully", order: populated || order });
  } catch (error: any) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getOrdersByFilter = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      orderNumber,
      staffId,
      status,
      supplierIds,
      sortBy,
      order,
      page = 1,
      limit = 10,
    } = req.query;

    if (Number(page) < 1 || Number(limit) < 1) {
      res.status(400).json({ message: "Page and limit must be > 0" });
      return;
    }

    const query: any = req.user?.isAdmin ? {} : { staffId: req.user?.userId };

    if (status) query.status = status;
    if (staffId) query.staffId = staffId;
    if (orderNumber) {
      query.orderNumber = { $regex: orderNumber, $options: "i" };
    }

    if (supplierIds) {
      let supplierIdArray: string[] = [];
      if (Array.isArray(supplierIds)) supplierIdArray = supplierIds as string[];
      else if (typeof supplierIds === "string")
        supplierIdArray = supplierIds.split(",");
      else supplierIdArray = [String(supplierIds)];

      supplierIdArray = supplierIdArray
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      if (supplierIdArray.length > 0) {
        query.supplierId = { $in: supplierIdArray };
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortField = sortBy?.toString() || "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    const orders = await Order.find(query)
      .populate([
        { path: "staffId", select: "avatar email fullname" },
        {
          path: "supplierId",
          select:
            "email name image contactPerson address phone1 phone2 phone3 city",
        },
        {
          path: "items",
          populate: {
            path: "productId",
            select: "name currentStock imageUrl barcode",
          },
        },
      ])
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res
      .status(200)
      .json({ orders, total, pages: Math.ceil(total / Number(limit)) });
  } catch (error: any) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getOrderStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const baseQuery: any = req.user?.isAdmin
      ? {}
      : { staffId: req.user?.userId };

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const notAssignedOrders = await Order.countDocuments({
      ...baseQuery,
      status: "not assigned",
    });
    const assignedOrders = await Order.countDocuments({
      ...baseQuery,
      status: "assigned",
    });
    const pendingReviewOrders = await Order.countDocuments({
      ...baseQuery,
      status: "pending_review",
    });
    const verifiedOrders = await Order.countDocuments({
      ...baseQuery,
      status: "verified",
    });
    const paidOrders = await Order.countDocuments({
      ...baseQuery,
      status: "paid",
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalValueAgg = await Order.aggregate([
      {
        $match: {
          ...baseQuery,
          status: "paid",
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, totalValue: { $sum: "$totalAmount" } } },
    ]);
    const totalValue =
      totalValueAgg.length > 0 ? totalValueAgg[0].totalValue : 0;

    res.status(200).json({
      notAssignedOrders,
      assignedOrders,
      pendingReviewOrders,
      verifiedOrders,
      paidOrders,
      totalValue: parseFloat(totalValue.toFixed(2)),
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch order statistics",
      error: error.message,
    });
  }
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).populate([
      { path: "staffId", select: "avatar email fullname" },
      {
        path: "items",
        populate: {
          path: "productId",
          select: "name price quantity",
        },
      },
    ]);

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    if (order.staffId?.toString() !== req.user?.userId && !req.user?.isAdmin) {
      res.status(404).json({ message: "You can't access this order" });
      return;
    }

    res.status(200).json({ order });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getOrderAnalytics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { period = "month" } = req.query;
    const validPeriods = ["week", "month", "year"];
    if (!validPeriods.includes(period as string)) {
      res.status(400).json({ message: "Invalid period. Use 'week','month','year'" });
      return;
    }

    const totalOrders = await Order.countDocuments();
    const notAssignedOrders = await Order.countDocuments({ status: "not assigned" });
    const assignedOrders = await Order.countDocuments({ status: "assigned" });
    const pendingReviewOrders = await Order.countDocuments({ status: "pending_review" });
    const verifiedOrders = await Order.countDocuments({ status: "verified" });
    const paidOrders = await Order.countDocuments({ status: "paid" });

    const totalSpendingAgg = await Order.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalSpent = totalSpendingAgg.length ? totalSpendingAgg[0].total : 0;

    // Period aggregation
    let groupStage: any = {};
    let sortStage: any = {};
    let limitCount = 12;
    let periodLabel: any = {};

    if (period === "week") {
      groupStage._id = {
        year: { $year: "$createdAt" },
        week: { $week: "$createdAt" },
      };
      sortStage = { "_id.year": -1, "_id.week": -1 };
      limitCount = 8;
      periodLabel = {
        $concat: [{ $toString: "$_id.year" }, "-W", { $toString: "$_id.week" }],
      };
    } else if (period === "month") {
      groupStage._id = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
      sortStage = { "_id.year": -1, "_id.month": -1 };
      limitCount = 12;
      periodLabel = {
        $concat: [
          { $toString: "$_id.year" },
          "-",
          {
            $cond: [
              { $lt: ["$_id.month", 10] },
              { $concat: ["0", { $toString: "$_id.month" }] },
              { $toString: "$_id.month" },
            ],
          },
        ],
      };
    } else {
      groupStage._id = { year: { $year: "$createdAt" } };
      sortStage = { "_id.year": -1 };
      limitCount = 5;
      periodLabel = { $toString: "$_id.year" };
    }

    groupStage.totalOrders = { $sum: 1 };
    groupStage.totalSpent = {
      $sum: {
        $cond: [{ $eq: ["$status", "paid"] }, "$totalAmount", 0],
      },
    };
    groupStage.notAssignedOrders = {
      $sum: { $cond: [{ $eq: ["$status", "not assigned"] }, 1, 0] },
    };
    groupStage.assignedOrders = {
      $sum: { $cond: [{ $eq: ["$status", "assigned"] }, 1, 0] },
    };
    groupStage.pendingReviewOrders = {
      $sum: { $cond: [{ $eq: ["$status", "pending_review"] }, 1, 0] },
    };
    groupStage.verifiedOrders = {
      $sum: { $cond: [{ $eq: ["$status", "verified"] }, 1, 0] },
    };
    groupStage.paidOrders = {
      $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] },
    };

    const periodData = await Order.aggregate([
      { $group: groupStage },
      { $sort: sortStage },
      { $limit: limitCount },
      { $addFields: { periodLabel } },
      {
        $project: {
          _id: 0,
          periodLabel: 1,
          totalOrders: 1,
          totalSpent: 1,
          notAssignedOrders: 1,
          assignedOrders: 1,
          pendingReviewOrders: 1,
          verifiedOrders: 1,
          paidOrders: 1,
        },
      },
    ]);

    periodData.reverse();

    res.status(200).json({
      summary: {
        totalOrders,
        notAssignedOrders,
        assignedOrders,
        pendingReviewOrders,
        verifiedOrders,
        paidOrders,
        totalSpent,
      },
      period,
      data: periodData,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};