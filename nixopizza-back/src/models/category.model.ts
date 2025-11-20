import { Document, Schema, model } from "mongoose";
import type { Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description: string;
  image: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true,unique: true },
    description: { type: String, required: false },
    image: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const Category: Model<ICategory> = model<ICategory>("Category", categorySchema);
export default Category;
