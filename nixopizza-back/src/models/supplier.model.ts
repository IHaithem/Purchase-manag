import { Document, Schema, model } from "mongoose";

export interface ISupplier extends Document {
  name: string;
  contactPerson: String;
  email?: string;
  phone1: string;
  phone2?: string;
  phone3?: string;
  address: string;
  city?: string;
  categoryIds: Schema.Types.ObjectId[];
  image: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: [true, "Shop Name Is Required"],
    },
    contactPerson: {
      type: String,
      required: [true, "contact Person Name Is Required"],
    },
    email: {
      type: String,
      required: false,
      trim: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    phone1: {
      type: String,
      required: [true, "Phone Number Is Required"],
    },
    phone2: {
      type: String,
    },
    phone3: {
      type: String,
    },
    address: {
      type: String,
      required: [true, "Address Is Required"],
    },
    city: {
      type: String,
    },
    image: {
      type: String,
    },
    notes: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    categoryIds: {
      type: [Schema.Types.ObjectId],
      ref: "Category",
    },
  },
  {
    timestamps: true,
  }
);

const Supplier = model<ISupplier>("Supplier", supplierSchema);
export default Supplier;
