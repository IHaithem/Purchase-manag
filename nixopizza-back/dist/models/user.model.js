"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
    fullname: {
        type: String,
        required: [true, "Full Name Is Required"],
    },
    email: {
        type: String,
        required: [true, "User Email Is Required"],
        trim: true,
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please fill a valid email address",
        ],
    },
    password: {
        type: String,
        default: null,
        select: false,
    },
    role: {
        type: String,
        enum: ["admin", "staff"],
        default: "staff",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    avatar: {
        type: String,
    },
    phone: {
        type: String,
    },
    address: {
        type: String,
    },
}, {
    timestamps: true,
});
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    if (!this.password)
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        return next();
    }
    catch (err) {
        return next(err); //
    }
});
userSchema.methods.comparePassword = async function (candidate) {
    if (!this.password) {
        throw new Error("Password hash not loaded on user document");
    }
    return bcryptjs_1.default.compare(candidate, this.password);
};
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
//# sourceMappingURL=user.model.js.map