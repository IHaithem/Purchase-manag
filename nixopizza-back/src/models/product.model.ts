import { Schema, model, Document, MongooseError } from "mongoose";

export interface IProduct extends Document {
  name: string;
  barcode: string;
  unit: "liter" | "kilogram" | "box" | "piece" | "meter" | "pack"| "bottle";
  categoryId: Schema.Types.ObjectId;
  imageUrl: string;
  description?: string;
  currentStock: number;
  minQty: number;
  recommendedQty: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product Name Is Required"],
      trim: true,
    },
    barcode: {
      type: String,
      unique: false,
    },
    unit: {
      type: String,
      enum: ["liter", "kilogram", "box", "piece", "meter", "pack","bottle"],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product Category Is Required"],
    },
    imageUrl: {
      type: String,
      required: [true, "Product Image Is Required"],
    },
    description: {
      type: String,
    },
    currentStock: {
      type: Number,
      required: [true, "Product Stock Is Required"],
      default: 0,
    },
    minQty: {
      type: Number,
      default: 0,
    },
    recommendedQty: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = model<IProduct>("Product", productSchema);
export default Product;
