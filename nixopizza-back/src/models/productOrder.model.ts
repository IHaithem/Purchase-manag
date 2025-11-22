import { Schema, model, Types, HydratedDocument } from "mongoose";

export interface IProductOrder {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
  expirationDate: Date;
  unitCost: number;
  remainingQte: number;
  isExpired: boolean;
  expiredQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductOrderDocument = HydratedDocument<IProductOrder>;

const productOrderSchema = new Schema<IProductOrder>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: [true, "productId is Required"],
      ref: "Product",
    },
    quantity: {
      type: Number,
      required: [true, "Product Quantity is Required"],
      min: 0,
    },
    expirationDate: {
      type: Date,
    },
    unitCost: {
      type: Number,
      required: [true, "Product Price is Required"],
      min: 0,
    },
    remainingQte: {
      type: Number,
      default: 0,
      min: 0,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    expiredQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient expiration queries
productOrderSchema.index({ expirationDate: 1, isExpired: 1 });

const ProductOrder = model<IProductOrder>("ProductOrder", productOrderSchema);
export default ProductOrder;