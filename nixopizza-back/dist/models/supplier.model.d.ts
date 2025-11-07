import { Document, Schema } from "mongoose";
export interface ISupplier extends Document {
    name: string;
    contactPerson: String;
    email: string;
    phone1: string;
    phone2: string;
    phone3: string;
    city: string;
    address: string;
    categoryIds: Schema.Types.ObjectId[];
    image: string;
    notes?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const Supplier: import("mongoose").Model<ISupplier, {}, {}, {}, Document<unknown, {}, ISupplier, {}> & ISupplier & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Supplier;
//# sourceMappingURL=supplier.model.d.ts.map