"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Auth_1 = require("../middlewares/Auth");
const task_controller_1 = require("../controllers/task.controller");
const taskRouter = (0, express_1.Router)();
taskRouter.use(Auth_1.authenticate);
taskRouter.post("/", Auth_1.requireAdmin, task_controller_1.createTask);
taskRouter.get("/", task_controller_1.getTasks);
taskRouter.get("/:taskId", task_controller_1.getTaskById);
taskRouter.put("/:taskId", task_controller_1.updateTaskStatus);
exports.default = taskRouter;
//# sourceMappingURL=task.router.js.map