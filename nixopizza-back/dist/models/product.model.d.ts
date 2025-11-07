import { Schema, Document } from "mongoose";
export interface IProduct extends Document {
    name: string;
    barcode: string;
    unit: "liter" | "kilogram" | "box" | "piece" | "meter" | "pack" | "bottle";
    categoryId: Schema.Types.ObjectId;
    imageUrl: string;
    currentStock: number;
    minQty: number;
    recommendedQty: number;
    createdAt?: Date;
    updatedAt?: Date;
}
declare const Product: import("mongoose").Model<IProduct, {}, {}, {}, Document<unknown, {}, IProduct, {}> & IProduct & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Product;
//# sourceMappingURL=product.model.d.ts.map