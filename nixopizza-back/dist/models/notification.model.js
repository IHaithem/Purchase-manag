"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ["low_stock", "budget_alert", "expiry_warning"],
    },
    title: String,
    message: String,
    isRead: {
        type: Boolean,
        default: false,
    },
    actionUrl: String,
    recipientRole: {
        type: String,
        default: "",
    },
}, { timestamps: true });
const Notification = (0, mongoose_1.model)("Notification", notificationSchema);
exports.default = Notification;
//# sourceMappingURL=notification.model.js.map