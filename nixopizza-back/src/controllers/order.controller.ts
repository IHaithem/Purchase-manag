// controllers/order.controller.ts
import { Request, Response } from "express";
import Product from "../models/product.model";
import Order from "../models/order.model";
import ProductOrder from "./productOrder.controller";

const generateOrderNumber = () => {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
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
      expectedDate,
    }: {
      items: {
        productId: string;
        quantity: number;
        unitCost: number;
        expirationDate: Date;
      }[];
      supplierId: string;
      notes: string;
      expectedDate?: Date;
    } = req.body;


    const productOrdersPromises = items.map(
      async ({ productId, quantity, unitCost, expirationDate }) => {
        const product = await Product.findById(productId);
        if (!product) throw new Error("Product not found");

        // Don't update stock yet - only when status becomes "confirmed"
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

    // Calculate total amount from items
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.unitCost * item.quantity;
    }

    const order = new Order({
      items: productOrders,
      supplierId,
      status: "not assigned", // Start as "not assigned"
      totalAmount,
      notes,
      orderNumber: generateOrderNumber(),
      expectedDate,
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

// New endpoint to assign order to staff
export const assignOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
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
      res.status(400).json({ message: "Order is already assigned" });
      return;
    }

    order.staffId = staffId;
    order.status = "assigned";
    order.assignedDate = new Date();

    await order.save();
    res.status(200).json({ message: "Order assigned successfully", order });
  } catch (error: any) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// New endpoint to confirm order (with bill upload)
export const confirmOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
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
      res.status(400).json({
        message: "Order must be assigned before confirmation",
      });
      return;
    }

    // Check if bill is uploaded
    const filename = req.file?.filename;
    if (!filename) {
      res.status(400).json({ message: "Bill image is required" });
      return;
    }

    // Update total amount
    if (totalAmount) {
      order.totalAmount = parseFloat(totalAmount);
    }

    // Update stock when order is confirmed
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

    order.bon = `/uploads/orders/${filename}`;
    order.status = "confirmed";
    order.confirmedDate = new Date();

    await order.save();
    res.status(200).json({ message: "Order confirmed successfully", order });
  } catch (error: any) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const orderId = req.params.orderId;
    const { status, notes, expectedDate } = req.body;

    const validStatuses = ["not assigned", "assigned", "confirmed", "paid", "canceled"];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({
        message: `Invalid status. Use one of: ${validStatuses.join(", ")}`,
      });
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Handle status change to paid
    if (status === "paid" && order.status === "confirmed") {
      order.status = "paid";
      order.paidDate = new Date();
    }

    // Handle status change to canceled
    if (status === "canceled") {
      order.status = "canceled";
      order.canceledDate = new Date();
    }

    // Update notes if provided
    if (notes !== undefined) {
      order.notes = notes;
    }

    // Update expectedDate if provided
    if (expectedDate !== undefined) {
      order.expectedDate = expectedDate;
    }

    await order.save();
    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error: any) {
    res.status(500).json({
      message: "Internal Server Error",
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
    if (orderNumber)
      query.orderNumber = { $regex: orderNumber, $options: "i" };


    if (supplierIds) {
      let supplierIdArray: string[] = [];

      if (Array.isArray(supplierIds)) {
        
        supplierIdArray = supplierIds.map((id) =>
          typeof id === "string" ? id : String(id)
        );
      } else if (typeof supplierIds === "string") {

        supplierIdArray = supplierIds.split(",");
      } else {

        supplierIdArray = [String(supplierIds)];
      }


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
          select: "email name image contactPerson address phone1",
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

    const notAssignedCount = await Order.countDocuments({
      ...baseQuery,
      status: "not assigned",
    });
    const assignedCount = await Order.countDocuments({
      ...baseQuery,
      status: "assigned",
    });
    const confirmedCount = await Order.countDocuments({
      ...baseQuery,
      status: "confirmed",
    });
    const paidQuery = {
      ...baseQuery,
      status: "paid",
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    };
    const paidCount = await Order.countDocuments(paidQuery);


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
      notAssignedOrders: notAssignedCount,
      assignedOrders: assignedCount,
      confirmedOrders: confirmedCount,
      paidOrders: paidCount,
      totalValue: parseFloat(totalValue.toFixed(2)),
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
      res.status(400).json({
        message: "Invalid period. Use 'week', 'month', or 'year'",
      });
      return;
    }


    const totalOrders = await Order.countDocuments();
    const notAssignedOrders = await Order.countDocuments({
      status: "not assigned",
    });
    const assignedOrders = await Order.countDocuments({ status: "assigned" });
    const confirmedOrders = await Order.countDocuments({
      status: "confirmed",
    });
    const paidOrders = await Order.countDocuments({ status: "paid" });


    const totalSpending = await Order.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalSpent = totalSpending.length > 0 ? totalSpending[0].total : 0;


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
        $concat: [
          { $toString: "$_id.year" },
          "-W",
          { $toString: "$_id.week" },
        ],
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

      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
        },
      };
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
    groupStage.confirmedOrders = {
      $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
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
          notAssignedOrders: 1,
          assignedOrders: 1,
          confirmedOrders: 1,
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
        confirmedOrders,
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
