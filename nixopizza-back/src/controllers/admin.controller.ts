import Order from "../models/order.model";
import { Request, Response } from "express";
import User from "../models/user.model";
import { deleteImage } from "../utils/Delete";
import crypto from "crypto";
import { uploadBufferToBlob } from "../utils/blob";

function buildBlobKey(originalName: string) {
  const ext = (originalName.match(/\.[^/.]+$/) || [".bin"])[0];
  const unique = crypto.randomBytes(8).toString("hex");
  return `${Date.now()}-${unique}${ext}`;
}

/** GET /api/admin/staffs */
export const getAllStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, page = 1, limit = 10 } = req.query;
    if (Number(page) < 1 || Number(limit) < 1) {
      res.status(400).json({ message: "Page and limit must be greater than 0" });
      return;
    }
    const query: any = {};
    if (name) {
      query.fullname = { $regex: name.toString(), $options: "i" };
    }
    const skip = (Number(page) - 1) * Number(limit);
    const limitNum = Number(limit);

    const staffs = await User.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);
    const pages = Math.ceil(total / limitNum);

    res.status(200).json({
      message: "Staff retrieved successfully",
      staffs,
      total,
      pages,
      currentPage: Number(page),
    });
  } catch (error: any) {
    console.error("getAllStaff error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/** POST /api/admin/staffs */
export const newStaffMember = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { fullname, email, password, phone1, phone2, phone3, address } = req.body;
    if (!fullname || !email || !password) {
      res.status(400).json({ message: "fullname, email and password are required" });
      return;
    }
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }

    const staff = new User({
      fullname,
      email,
      password,
      phone1,
      phone2,
      phone3,
      address,
    });

    if (req.file) {
      const key = buildBlobKey(req.file.originalname);
      const uploaded = await uploadBufferToBlob(key, req.file.buffer, req.file.mimetype);
      staff.avatar = uploaded.url;
    }

    await staff.save();
    res.status(201).json({ message: "Staff created successfully", staff });
  } catch (error: any) {
    console.error("newStaffMember error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/** PUT /api/admin/staffs/:staffId */
export const updateStaff = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { staffId } = req.params;
    const {
      fullname,
      email,
      phone1,
      phone2,
      phone3,
      address,
      status,
      notes,      // optional; not stored unless you added field
      password,   // optional new password
    } = req.body;

    const staff = await User.findById(staffId).select("+password");
    if (!staff) {
      res.status(404).json({ message: "Staff not found" });
      return;
    }

    // If email changes, enforce uniqueness
    if (email && email !== staff.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: staffId } });
      if (existingEmail) {
        res.status(409).json({ message: "Email already in use" });
        return;
      }
    }

    // Update only provided fields (keep old values otherwise)
    if (fullname) staff.fullname = fullname;
    if (email) staff.email = email;
    staff.phone1 = phone1 ?? staff.phone1;
    staff.phone2 = phone2 ?? staff.phone2;
    staff.phone3 = phone3 ?? staff.phone3;
    staff.address = address ?? staff.address;
    if (typeof status !== "undefined") {
      staff.isActive = status === "Active";
    }

    // Optional password update
    if (password && password.trim().length > 0) {
      staff.password = password.trim(); // will be hashed by pre-save
    }

    if (req.file) {
      if (staff.avatar && staff.avatar.startsWith("/uploads/")) {
        try {
          deleteImage(staff.avatar);
        } catch (e) {
          console.warn("Failed to delete legacy avatar:", e);
        }
      }
      const key = buildBlobKey(req.file.originalname);
      const uploaded = await uploadBufferToBlob(
        key,
        req.file.buffer,
        req.file.mimetype
      );
      staff.avatar = uploaded.url;
    }

    await staff.save();

    res.status(200).json({
      message: "Staff updated successfully",
      staff: {
        _id: staff._id,
        fullname: staff.fullname,
        email: staff.email,
        phone1: staff.phone1,
        phone2: staff.phone2,
        phone3: staff.phone3,
        address: staff.address,
        isActive: staff.isActive,
        avatar: staff.avatar,
      },
    });
  } catch (error: any) {
    console.error("updateStaff error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/** DELETE /api/admin/staffs/:staffId */
export const deleteStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffId } = req.params;
    const staff = await User.findByIdAndDelete(staffId);
    if (!staff) {
      res.status(404).json({ message: "Staff not found" });
      return;
    }
    if (staff.avatar && staff.avatar.startsWith("/uploads/")) {
      try {
        deleteImage(staff.avatar);
      } catch (e) {
        console.warn("Failed to delete legacy avatar:", e);
      }
    }
    res.status(200).json({ message: "Staff deleted successfully" });
  } catch (error: any) {
    console.error("deleteStaff error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getCategoryAnalytics = async (req: Request, res: Response) => {
  try {
    const { period = "week" } = req.query;

    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "6month":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setFullYear(now.getFullYear() - 1);
    }

    const orderCount = await Order.countDocuments({
      status: "paid",
      paidDate: { $exists: true, $ne: null },
    });
    console.log("Total paid orders with paidDate:", orderCount);

    const ordersInRange = await Order.countDocuments({
      status: "paid",
      paidDate: { $gte: startDate, $lte: now },
    });
    console.log("Orders in date range:", ordersInRange);

    const analytics = await Order.aggregate([
      {
        $match: {
          status: "paid",

          $or: [
            {
              paidDate: {
                $exists: true,
                $ne: null,
                $gte: startDate,
                $lte: now,
              },
            },
            {
              paidDate: { $exists: false },
              createdAt: { $gte: startDate, $lte: now },
            },
            {
              paidDate: null,
              createdAt: { $gte: startDate, $lte: now },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$items",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "productorders",
          localField: "items",
          foreignField: "_id",
          as: "productOrder",
        },
      },
      {
        $unwind: {
          path: "$productOrder",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productOrder.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "product.categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: "$category._id",
          categoryName: { $first: "$category.name" },
          totalSpent: {
            $sum: {
              $multiply: ["$productOrder.quantity", "$productOrder.unitCost"],
            },
          },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          categoryName: 1,
          totalSpent: 1,
          orderCount: 1,
        },
      },
      { $sort: { totalSpent: -1 } },
    ]);
    res.json({
      success: true,
      period,
      dateRange: { startDate, endDate: now },
      data: analytics,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ success: false, message: "Analytics fetch failed" });
  }
};

export const getMonthlySpendingAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    const { months = "6" } = req.query; // "6" | "12"
    const monthsCount = parseInt(months as string);

    if (![6, 12].includes(monthsCount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid months parameter. Use 6 or 12",
      });
    }

    // Define time range
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(now.getMonth() - monthsCount);
    startDate.setDate(1); // Start from the first day of the month
    startDate.setHours(0, 0, 0, 0);

    // Debug: Check date range
    console.log("Date range:", { startDate, endDate: now, monthsCount });

    const analytics = await Order.aggregate([
      {
        $match: {
          status: "paid",
          // Use paidDate if available, otherwise fall back to createdAt
          $or: [
            {
              paidDate: {
                $exists: true,
                $ne: null,
                $gte: startDate,
                $lte: now,
              },
            },
            {
              paidDate: { $exists: false },
              createdAt: { $gte: startDate, $lte: now },
            },
            {
              paidDate: null,
              createdAt: { $gte: startDate, $lte: now },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$items",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "productorders",
          localField: "items",
          foreignField: "_id",
          as: "productOrder",
        },
      },
      {
        $unwind: {
          path: "$productOrder",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $addFields: {
          // Use paidDate if available, otherwise use createdAt
          dateToUse: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$paidDate", null] },
                  { $ne: ["$paidDate", undefined] },
                ],
              },
              then: "$paidDate",
              else: "$createdAt",
            },
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateToUse" },
            month: { $month: "$dateToUse" },
          },
          totalSpent: {
            $sum: {
              $multiply: ["$productOrder.quantity", "$productOrder.unitCost"],
            },
          },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalSpent: 1,
          orderCount: 1,
          // Create a readable month name
          monthName: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id.month", 1] }, then: "January" },
                { case: { $eq: ["$_id.month", 2] }, then: "February" },
                { case: { $eq: ["$_id.month", 3] }, then: "March" },
                { case: { $eq: ["$_id.month", 4] }, then: "April" },
                { case: { $eq: ["$_id.month", 5] }, then: "May" },
                { case: { $eq: ["$_id.month", 6] }, then: "June" },
                { case: { $eq: ["$_id.month", 7] }, then: "July" },
                { case: { $eq: ["$_id.month", 8] }, then: "August" },
                { case: { $eq: ["$_id.month", 9] }, then: "September" },
                { case: { $eq: ["$_id.month", 10] }, then: "October" },
                { case: { $eq: ["$_id.month", 11] }, then: "November" },
                { case: { $eq: ["$_id.month", 12] }, then: "December" },
              ],
              default: "Unknown",
            },
          },
          // Create a period identifier for easier frontend handling
          period: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: {
                  if: { $lt: ["$_id.month", 10] },
                  then: { $concat: ["0", { $toString: "$_id.month" }] },
                  else: { $toString: "$_id.month" },
                },
              },
            ],
          },
        },
      },
      {
        $sort: {
          year: 1,
          month: 1,
        },
      },
    ]);

    // Fill in missing months with zero spending
    const filledData = fillMissingMonths(analytics, startDate, now);

    // Calculate some summary statistics
    const totalSpent = filledData.reduce(
      (sum, item) => sum + item.totalSpent,
      0
    );
    const avgMonthlySpending = totalSpent / filledData.length;
    const maxMonth = filledData.reduce(
      (max, item) => (item.totalSpent > max.totalSpent ? item : max),
      filledData[0] || { totalSpent: 0 }
    );

    console.log("Monthly analytics result:", analytics);

    res.json({
      success: true,
      months: monthsCount,
      dateRange: { startDate, endDate: now },
      data: filledData,
      summary: {
        totalSpent: Math.round(totalSpent * 100) / 100,
        averageMonthlySpending: Math.round(avgMonthlySpending * 100) / 100,
        highestSpendingMonth: maxMonth,
      },
    });
  } catch (error) {
    console.error("Monthly analytics error:", error);
    res
      .status(500)
      .json({ success: false, message: "Monthly analytics fetch failed" });
  }
};

// Helper function to fill missing months with zero values
function fillMissingMonths(data: any[], startDate: Date, endDate: Date) {
  const filledData = [];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const current = new Date(startDate);
  current.setDate(1); // Set to first day of month

  while (current <= endDate) {
    const year = current.getFullYear();
    const month = current.getMonth() + 1; // getMonth() is 0-indexed

    // Find existing data for this month
    const existingData = data.find(
      (item) => item.year === year && item.month === month
    );

    if (existingData) {
      filledData.push(existingData);
    } else {
      // Add zero data for missing months
      filledData.push({
        year,
        month,
        monthName: monthNames[month - 1],
        totalSpent: 0,
        orderCount: 0,
        period: `${year}-${month.toString().padStart(2, "0")}`,
      });
    }

    current.setMonth(current.getMonth() + 1);
  }

  return filledData;
}
