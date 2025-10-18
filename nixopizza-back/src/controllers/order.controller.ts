import { Request, Response } from "express";
import Product from "../models/product.model";
import Order from "../models/order.model";
import ProductOrder from "./productOrder.controller";

const generateOrderNumber = () => {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000); // 4-digit
  return `ORD-${date}-${rand}`;
};

export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      items,
      supplierId,
      notes,
    }: {
      items: {
        productId: string;
        quantity: number;
        unitCost: number;
        expirationDate: Date;
      }[];
      supplierId: string;
      notes: string;
    } = req.body;

    let totalAmount = 0;
    const productOrdersPromises = items.map(
      async ({ productId, quantity, unitCost, expirationDate }) => {
        const product = await Product.findById(productId);
        if (!product) throw new Error("Product not found");

        product.currentStock = product.currentStock + quantity;
        await product.save();

        const productOrder = await ProductOrder.create({
          productId,
          quantity,
          unitCost,
          expirationDate,
          remainingQte: quantity,
        });
        await productOrder.save();

        totalAmount = totalAmount + unitCost * quantity;

        return productOrder._id;
      }
    );

    const productOrders = await Promise.all(productOrdersPromises);

    const order = new Order({
      items: productOrders,
      supplierId,
      staffId: req.user?.userId,
      totalAmount,
      notes,
      orderNumber: generateOrderNumber(),
    });

    const filename = req.file?.filename;
    if (filename) {
      order.bon = `/uploads/orders/${filename}`;
    }

    await order.save();

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getOrdersByFilter = async (
  req: Request,
  res: Response
): Promise<void> => {
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
      res
        .status(400)
        .json({ message: "Page and limit must be greater than 0" });
      return;
    }

    const query: any = req.user?.isAdmin ? {} : { staffId: req.user?.userId };

    if (status) query.status = status;
    if (staffId) query.staffId = staffId;
    if (orderNumber) query.orderNumber = { $regex: orderNumber, $options: "i" };

    // Handle supplierIds filter
    if (supplierIds) {
      let supplierIdArray: string[] = [];

      if (Array.isArray(supplierIds)) {
        // If supplierIds is an array, convert each element to string
        supplierIdArray = supplierIds.map((id) =>
          typeof id === "string" ? id : String(id)
        );
      } else if (typeof supplierIds === "string") {
        // If supplierIds is a comma-separated string
        supplierIdArray = supplierIds.split(",");
      } else {
        // Handle single value case
        supplierIdArray = [String(supplierIds)];
      }

      // Filter out empty strings and trim whitespace
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
          select: "email name image contactPerson address phone",
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
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getOrderStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Base query for non-admin users
    const baseQuery: any = req.user?.isAdmin
      ? {}
      : { staffId: req.user?.userId };

    // Current month filter
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    // 1. Pending Orders
    const pendingQuery = { ...baseQuery, status: "pending" };
    const pendingCount = await Order.countDocuments(pendingQuery);

    // 2. Confirmed Orders
    const confirmedQuery = { ...baseQuery, status: "confirmed" };
    const confirmedCount = await Order.countDocuments(confirmedQuery);

    // 3. Paid Orders (this month only)
    const paidQuery = {
      ...baseQuery,
      status: "paid",
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    };
    const paidCount = await Order.countDocuments(paidQuery);

    // 4. Total Value (sum of totalAmount for paid orders this month)
    const totalValueResult = await Order.aggregate([
      {
        $match: {
          ...baseQuery,
          status: "paid",
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalValue =
      totalValueResult.length > 0 ? totalValueResult[0].totalValue : 0;

    res.status(200).json({
      pendingOrders: pendingCount,
      confirmedOrders: confirmedCount,
      paidOrders: paidCount,
      totalValue: parseFloat(totalValue.toFixed(2)), // Ensure 2 decimal places
    });
  } catch (error: any) {
    console.error("Order stats error:", error);
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
      // { path: "supplierId", select: "email" },
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

    if (order.staffId.toString() !== req.user?.userId && !req.user?.isAdmin) {
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

    // Validate period parameter
    const validPeriods = ["week", "month", "year"];
    if (!validPeriods.includes(period as string)) {
      res.status(400).json({
        message: "Invalid period. Use 'week', 'month', or 'year'",
      });
      return;
    }

    // Basic counts with correct status values
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const paidOrders = await Order.countDocuments({ status: "paid" });

    // Calculate total spending (what we spent on products)
    const totalSpending = await Order.aggregate([
      { $match: { status: "paid" } }, // Only count paid orders
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalSpent = totalSpending.length > 0 ? totalSpending[0].total : 0;

    // Dynamic aggregation based on selected period only
    let groupStage: any = {};
    let sortStage: any = {};
    let limitCount = 12;
    let periodLabel: any = {};

    if (period === "week") {
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        },
      };
      sortStage = { "_id.year": -1, "_id.week": -1 };
      limitCount = 8;
      periodLabel = {
        $concat: [{ $toString: "$_id.year" }, "-W", { $toString: "$_id.week" }],
      };
    } else if (period === "month") {
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
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
      // year
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
        },
      };
      sortStage = { "_id.year": -1 };
      limitCount = 5;
      periodLabel = { $toString: "$_id.year" };
    }

    // Add common fields to groupStage
    groupStage.totalOrders = { $sum: 1 };
    groupStage.totalSpent = {
      $sum: {
        $cond: [{ $eq: ["$status", "paid"] }, "$totalAmount", 0],
      },
    };
    groupStage.pendingOrders = {
      $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
    };
    groupStage.paidOrders = {
      $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] },
    };

    const periodData = await Order.aggregate([
      { $group: groupStage },
      { $sort: sortStage },
      { $limit: limitCount },
      {
        $addFields: {
          periodLabel: periodLabel,
        },
      },
      {
        $project: {
          _id: 1,
          periodLabel: 1,
          totalOrders: 1,
          totalSpent: 1,
          pendingOrders: 1,
          paidOrders: 1,
        },
      },
    ]);

    // Reverse to show chronological order (oldest to newest)
    periodData.reverse();

    res.status(200).json({
      summary: {
        totalOrders,
        pendingOrders,
        paidOrders,
        totalSpent: totalSpent,
      },
      period: period,
      data: periodData,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const updateOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;

    if (status && !["pending", "confirmed", "paid"].includes(status)) {
      res.status(400).json({
        message: "Invalid status. Use 'pending', 'confirmed', or 'paid'",
      });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // This condition was causing the issue
    if (req.file) {
      // This will be false when just updating status without file
      const filename = req.file?.filename;
      if (filename) {
        order.bon = `/uploads/orders/${filename}`;
      }
    }

    // Move status update outside the file condition
    if (status) {
      order.status = status;
      if (status === "paid") {
        order.paidDate = new Date();
      }
    }

    await order.save();
    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
