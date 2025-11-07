import { Document, Schema } from "mongoose";
export interface IProductOrder extends Document {
    productId: Schema.Types.ObjectId;
    quantity: number;
    expirationDate: Date;
    unitCost: number;
    remainingQte: number;
    isExpired: boolean;
    expiredQuantity: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const ProductOrder: import("mongoose").Model<IProductOrder, {}, {}, {}, Document<unknown, {}, IProductOrder, {}> & IProductOrder & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default ProductOrder;
//# sourceMappingURL=productOrder.model.d.ts.map