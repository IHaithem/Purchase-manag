"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushNotification = void 0;
const notification_model_1 = __importDefault(require("../models/notification.model"));
const pushNotification = async (title, message, type, actionUrl) => {
    await notification_model_1.default.create({ title, message, type, actionUrl });
};
exports.pushNotification = pushNotification;
//# sourceMappingURL=PushNotification.js.map