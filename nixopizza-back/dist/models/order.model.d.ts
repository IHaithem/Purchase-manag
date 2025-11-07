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
declare const Order: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}> & IOrder & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Order;
//# sourceMappingURL=order.model.d.ts.map