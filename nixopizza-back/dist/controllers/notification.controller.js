"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readAllNotifications = exports.readNotification = exports.getNotifications = void 0;
const notification_model_1 = __importDefault(require("../models/notification.model"));
const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        if (Number(page) < 1 || Number(limit) < 1) {
            res
                .status(400)
                .json({ message: "Page and limit must be greater than 0" });
            return;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const products = await notification_model_1.default.find()
            .sort({ ["createdAt"]: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await notification_model_1.default.countDocuments();
        res.status(200).json({
            total,
            pages: Math.ceil(total / Number(limit)),
            products,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Internal server error", err: error.message });
    }
};
exports.getNotifications = getNotifications;
const readNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await notification_model_1.default.findById(notificationId);
        if (!notification) {
            res.status(404).json({ message: "Notification not found" });
            return;
        }
        notification.isRead = true;
        await notification.save();
        res.status(200).json({ message: "Notification marked as read" });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Internal server error", err: error.message });
    }
};
exports.readNotification = readNotification;
const readAllNotifications = async (req, res) => {
    try {
        await notification_model_1.default.updateMany({ isRead: false }, { isRead: true });
        res.status(200).json({ message: "All notifications marked as read" });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Internal server error", err: error.message });
    }
};
exports.readAllNotifications = readAllNotifications;
//# sourceMappingURL=notification.controller.js.map