"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Multer_1 = require("../middlewares/Multer");
const Auth_1 = require("../middlewares/Auth");
const admin_controller_1 = require("../controllers/admin.controller");
const adminRouter = (0, express_1.Router)();
adminRouter.use(Auth_1.authenticate);
adminRouter.use(Auth_1.requireAdmin);
adminRouter.get("/staffs", admin_controller_1.getAllStaff);
adminRouter.post("/staffs", (0, Multer_1.upload)("staffs").single("image"), admin_controller_1.newStaffMember);
adminRouter.put("/staffs/:staffId", (0, Multer_1.upload)("staffs").single("image"), admin_controller_1.updateStaff);
adminRouter.get("/analytics/category", admin_controller_1.getCategoryAnalytics);
adminRouter.get("/analytics/monthly", admin_controller_1.getMonthlySpendingAnalytics);
exports.default = adminRouter;
//# sourceMappingURL=admin.router.js.map