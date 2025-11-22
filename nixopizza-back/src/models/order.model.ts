// models/order.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IStatusHistoryEntry {
  from: string | null;
  to: string;
  at: Date;
  by?: Schema.Types.ObjectId | null;
}

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
  statusHistory: IStatusHistoryEntry[];
}

const statusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    from: { type: String, default: null },
    to: { type: String, required: true },
    at: { type: Date, required: true },
    by: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    bon: { type: String },
    orderNumber: { type: String, required: true, unique: true },
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
      enum: ["not assigned", "assigned", "pending_review", "verified", "paid", "canceled"],
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
    statusHistory: { type: [statusHistorySchema], default: [] },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;