"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const supplierSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Shop Name Is Required"],
    },
    contactPerson: {
        type: String,
        required: [true, "contact Person Name Is Required"],
    },
    email: {
        type: String,
        required: [true, "Shop Email Is Required"],
        trim: true,
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please fill a valid email address",
        ],
    },
    phone: {
        type: String,
        required: [true, "Phone Number Is Required"],
    },
    address: {
        type: String,
        required: [true, "Address Is Required"],
    },
    image: {
        type: String,
    },
    notes: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    categoryIds: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "Category",
    },
}, {
    timestamps: true,
});
const Supplier = (0, mongoose_1.model)("Supplier", supplierSchema);
exports.default = Supplier;
//# sourceMappingURL=supplier.model.js.map