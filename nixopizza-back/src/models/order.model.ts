// models/order.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  bon: string;
  orderNumber: string;
  supplierId: Schema.Types.ObjectId;
  staffId: Schema.Types.ObjectId;
  status: "not assigned" | "assigned" | "confirmed" | "paid" | "canceled";
  totalAmount: number;
  items: Schema.Types.ObjectId[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  paidDate: Date;
  assignedDate: Date;
  confirmedDate: Date;
  expectedDate?: Date;
  canceledDate?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    bon: {
      type: String,
    },

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
      enum: ["not assigned", "assigned", "confirmed", "paid", "canceled"],
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
    
    notes: {
      type: String,
    },

    assignedDate: {
      type: Date,
    },

    confirmedDate: {
      type: Date,
    },

    paidDate: {
      type: Date,
    },

    expectedDate: {
      type: Date,
    },

    canceledDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
