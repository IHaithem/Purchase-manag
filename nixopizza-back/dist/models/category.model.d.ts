import { Document } from "mongoose";
import type { Model } from "mongoose";
export interface ICategory extends Document {
    name: string;
    description: string;
    image: string;
}
declare const Category: Model<ICategory>;
export default Category;
//# sourceMappingURL=category.model.d.ts.map