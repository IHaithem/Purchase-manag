"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskStatus = exports.getTaskById = exports.getTasks = exports.createTask = void 0;
const task_model_1 = __importDefault(require("../models/task.model"));
const PushNotification_1 = require("../utils/PushNotification");
const generateTaskNumber = () => {
    const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000); // 4-digit
    return `ORD-${date}-${rand}`;
};
const createTask = async (req, res) => {
    try {
        const { staffId, items, deadline } = req.body;
        if (!staffId || !items || !deadline || items.length === 0) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        const newTask = await task_model_1.default.create({
            taskNumber: generateTaskNumber(),
            staffId,
            items,
            deadline,
        });
        res
            .status(200)
            .json({ message: "Task created Successfully", task: newTask });
    }
    catch (error) {
        console.error("Error : ", error);
        res
            .status(500)
            .json({ message: "Internal server error", err: error.message });
    }
};
exports.createTask = createTask;
const getTasks = async (req, res) => {
    try {
        const { status, sortBy, order, taskNumber, page = 1, limit = 10, } = req.query;
        if (Number(page) < 1 || Number(limit) < 1) {
            res
                .status(400)
                .json({ message: "Page and limit must be greater than 0" });
            return;
        }
        const query = req.user?.isAdmin ? {} : { staffId: req.user?.userId };
        if (status)
            query.status = status;
        if (taskNumber)
            query.taskNumber = { $regex: taskNumber, $options: "i" };
        const sortField = sortBy?.toString() || "createdAt";
        const sortOrder = order === "asc" ? 1 : -1;
        const skip = (Number(page) - 1) * Number(limit);
        const tasks = await task_model_1.default.find()
            .populate("staffId", "fullname avatar email")
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(Number(limit));
        const total = await task_model_1.default.countDocuments(query);
        res.status(200).json({
            total,
            pages: Math.ceil(total / Number(limit)),
            tasks,
        });
    }
    catch (error) {
        console.error("Error : ", error);
        res
            .status(500)
            .json({ message: "Internal server error", err: error.message });
    }
};
exports.getTasks = getTasks;
const getTaskById = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await task_model_1.default.findById(taskId).populate("staffId", "fullname avatar email");
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        if (task.staffId._id?.toString() !== req.user?.userId &&
            !req.user?.isAdmin) {
            res.status(403).json({ message: "Access denied" });
            return;
        }
        res.status(200).json({ task });
    }
    catch (error) {
        console.error("Error : ", error);
        res
            .status(500)
            .json({ message: "Internal server error", err: error.message });
    }
};
exports.getTaskById = getTaskById;
const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        if (!["pending", "completed", "canceled"].includes(status)) {
            res.status(400).json({ message: "Invalid status value" });
            return;
        }
        const task = await task_model_1.default.findById(taskId);
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        if (task.staffId._id?.toString() !== req.user?.userId &&
            !req.user?.isAdmin) {
            res.status(403).json({ message: "Access denied" });
            return;
        }
        if (status === "canceled" && req.user?.isAdmin === false) {
            res.status(403).json({ message: "Only admins can cancel tasks" });
            return;
        }
        if (status === "completed" &&
            task.staffId._id?.toString() === req.user?.userId) {
            await (0, PushNotification_1.pushNotification)(` Task Completed: ${task.taskNumber} `, `The task ${task.taskNumber} has been marked as completed.`, "complited_task", `${process.env}/api/tasks/${task._id}`);
        }
        task.status = status;
        await task.save();
        res.status(200).json({ message: "Task status updated", task });
    }
    catch (error) {
        console.error("Error : ", error);
        res
            .status(500)
            .json({ message: "Internal server error", err: error.message });
    }
};
exports.updateTaskStatus = updateTaskStatus;
//# sourceMappingURL=task.controller.js.map