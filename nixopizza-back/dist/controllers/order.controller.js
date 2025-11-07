"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderAnalytics = exports.getOrder = exports.getOrderStats = exports.getOrdersByFilter = exports.updateOrder = exports.confirmOrder = exports.assignOrder = exports.createOrder = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
const productOrder_controller_1 = __importDefault(require("./productOrder.controller"));
const generateOrderNumber = () => {
    const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${date}-${rand}`;
};
const createOrder = async (req, res) => {
    try {
        const { items, supplierId, notes, expectedDate, } = req.body;
        const productOrdersPromises = items.map(async ({ productId, quantity, unitCost, expirationDate }) => {
            const product = await product_model_1.default.findById(productId);
            if (!product)
                throw new Error("Product not found");
            // Don't update stock yet - only when status becomes "confirmed"
            const productOrder = await productOrder_controller_1.default.create({
                productId,
                quantity,
                unitCost,
                expirationDate,
                remainingQte: quantity,
            });
            await productOrder.save();
            return productOrder._id;
        });
        const productOrders = await Promise.all(productOrdersPromises);
        // Calculate total amount from items
        let totalAmount = 0;
        for (const item of items) {
            totalAmount += item.unitCost * item.quantity;
        }
        const order = new order_model_1.default({
            items: productOrders,
            supplierId,
            status: "not assigned", // Start as "not assigned"
            totalAmount,
            notes,
            expectedDate,
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
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.createOrder = createOrder;
// New endpoint to assign order to staff
const assignOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { staffId } = req.body;
        if (!staffId) {
            res.status(400).json({ message: "Staff ID is required" });
            return;
        }
        const order = await order_model_1.default.findById(orderId);
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
    }
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
exports.assignOrder = assignOrder;
// New endpoint to confirm order (with bill upload)
const confirmOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { totalAmount } = req.body;
        const order = await order_model_1.default.findById(orderId).populate({
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
            const productOrder = await productOrder_controller_1.default.findById(itemId);
            if (productOrder) {
                const product = await product_model_1.default.findById(productOrder.productId);
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
    }
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
exports.confirmOrder = confirmOrder;
const updateOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { status, expectedDate, canceledDate } = req.body;
        const validStatuses = ["not assigned", "assigned", "confirmed", "paid", "canceled"];
        if (status && !validStatuses.includes(status)) {
            res.status(400).json({
                message: `Invalid status. Use one of: ${validStatuses.join(", ")}`,
            });
            return;
        }
        const order = await order_model_1.default.findById(orderId);
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
            order.canceledDate = canceledDate ? new Date(canceledDate) : new Date();
        }
        // Update expectedDate if provided
        if (expectedDate !== undefined) {
            order.expectedDate = expectedDate ? new Date(expectedDate) : undefined;
        }
        await order.save();
        res.status(200).json({ message: "Order updated successfully", order });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
exports.updateOrder = updateOrder;
const getOrdersByFilter = async (req, res) => {
    try {
        const { orderNumber, staffId, status, supplierIds, sortBy, order, page = 1, limit = 10, } = req.query;
        if (Number(page) < 1 || Number(limit) < 1) {
            res
                .status(400)
                .json({ message: "Page and limit must be greater than 0" });
            return;
        }
        const query = req.user?.isAdmin ? {} : { staffId: req.user?.userId };
        if (status)
            query.status = status;
        if (staffId)
            query.staffId = staffId;
        if (orderNumber)
            query.orderNumber = { $regex: orderNumber, $options: "i" };
        if (supplierIds) {
            let supplierIdArray = [];
            if (Array.isArray(supplierIds)) {
                supplierIdArray = supplierIds.map((id) => typeof id === "string" ? id : String(id));
            }
            else if (typeof supplierIds === "string") {
                supplierIdArray = supplierIds.split(",");
            }
            else {
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
        const orders = await order_model_1.default.find(query)
            .populate([
            { path: "staffId", select: "avatar email fullname" },
            {
                path: "supplierId",
                select: "email name image contactPerson address phone1 phone2 phone3 city",
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
        const total = await order_model_1.default.countDocuments(query);
        res
            .status(200)
            .json({ orders, total, pages: Math.ceil(total / Number(limit)) });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
};
exports.getOrdersByFilter = getOrdersByFilter;
const getOrderStats = async (req, res) => {
    try {
        const baseQuery = req.user?.isAdmin
            ? {}
            : { staffId: req.user?.userId };
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const endOfMonth = new Date();
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);
        const notAssignedCount = await order_model_1.default.countDocuments({
            ...baseQuery,
            status: "not assigned",
        });
        const assignedCount = await order_model_1.default.countDocuments({
            ...baseQuery,
            status: "assigned",
        });
        const confirmedCount = await order_model_1.default.countDocuments({
            ...baseQuery,
            status: "confirmed",
        });
        const paidQuery = {
            ...baseQuery,
            status: "paid",
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        };
        const paidCount = await order_model_1.default.countDocuments(paidQuery);
        const totalValueResult = await order_model_1.default.aggregate([
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
        const totalValue = totalValueResult.length > 0 ? totalValueResult[0].totalValue : 0;
        res.status(200).json({
            notAssignedOrders: notAssignedCount,
            assignedOrders: assignedCount,
            confirmedOrders: confirmedCount,
            paidOrders: paidCount,
            totalValue: parseFloat(totalValue.toFixed(2)),
        });
    }
    catch (error) {
        console.error("Order stats error:", error);
        res.status(500).json({
            message: "Failed to fetch order statistics",
            error: error.message,
        });
    }
};
exports.getOrderStats = getOrderStats;
const getOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await order_model_1.default.findById(orderId).populate([
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
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
};
exports.getOrder = getOrder;
const getOrderAnalytics = async (req, res) => {
    try {
        const { period = "month" } = req.query;
        const validPeriods = ["week", "month", "year"];
        if (!validPeriods.includes(period)) {
            res.status(400).json({
                message: "Invalid period. Use 'week', 'month', or 'year'",
            });
            return;
        }
        const totalOrders = await order_model_1.default.countDocuments();
        const notAssignedOrders = await order_model_1.default.countDocuments({
            status: "not assigned",
        });
        const assignedOrders = await order_model_1.default.countDocuments({ status: "assigned" });
        const confirmedOrders = await order_model_1.default.countDocuments({
            status: "confirmed",
        });
        const paidOrders = await order_model_1.default.countDocuments({ status: "paid" });
        const totalSpending = await order_model_1.default.aggregate([
            { $match: { status: "paid" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]);
        const totalSpent = totalSpending.length > 0 ? totalSpending[0].total : 0;
        let groupStage = {};
        let sortStage = {};
        let limitCount = 12;
        let periodLabel = {};
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
        }
        else if (period === "month") {
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
        }
        else {
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
        const periodData = await order_model_1.default.aggregate([
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
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
};
exports.getOrderAnalytics = getOrderAnalytics;
//# sourceMappingURL=order.controller.js.map