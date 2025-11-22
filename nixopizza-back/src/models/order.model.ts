// models/order.model.ts (UPDATED)
import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  bon: string;
  orderNumber: string;
  supplierId: Schema.Types.ObjectId;
  staffId: Schema.Types.ObjectId;
  status: "not assigned" | "assigned" | "pending_review" | "verified" | "paid" | "canceled";
  totalAmount: number;
  items: Schema.Types.ObjectId[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  assignedDate?: Date;
  pendingReviewDate?: Date;
  verifiedDate?: Date;
  paidDate?: Date;
  expectedDate?: Date;
  canceledDate?: Date;
  // Legacy field for backward compatibility during migration
  confirmedDate?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    bon: { type: String },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Order Supplier is required"],
    },

    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: [
        "not assigned",
        "assigned",
        "pending_review",
        "verified",
        "paid",
        "canceled",
      ],
      default: "not assigned",
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    items: {
      type: [Schema.Types.ObjectId],
      ref: "ProductOrder",
      minlength: 1,
    },

    notes: { type: String },

    assignedDate: { type: Date },
    pendingReviewDate: { type: Date },
    verifiedDate: { type: Date },
    paidDate: { type: Date },
    expectedDate: { type: Date },
    canceledDate: { type: Date },

    // Legacy field (optional cleanup later)
    confirmedDate: { type: Date },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;