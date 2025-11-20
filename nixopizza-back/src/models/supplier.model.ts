import { Schema, model, Types } from "mongoose";

export interface ISupplier {
  _id: Types.ObjectId;
  name: string;
  contactPerson: string;
  email?: string;
  phone1: string;
  phone2?: string;
  phone3?: string;
  address: string;
  city?: string;
  categoryIds: Types.ObjectId[];
  image?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: [true, "Shop Name Is Required"], trim: true },
    contactPerson: { type: String, required: [true, "Contact Person Name Is Required"], trim: true },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, "Please fill a valid email address"],
      set: (v: string) => (v && v.trim() !== "" ? v.trim().toLowerCase() : undefined),
    },
    phone1: { type: String, required: [true, "Phone Number Is Required"], trim: true },
    phone2: { type: String, trim: true },
    phone3: { type: String, trim: true },
    address: { type: String, required: [true, "Address Is Required"], trim: true },
    city: { type: String, trim: true },
    image: { type: String },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
    categoryIds: { type: [Schema.Types.ObjectId], ref: "Category", default: [] },
  },
  { timestamps: true }
);

// Sparse unique index for optional email
supplierSchema.index({ email: 1 }, { unique: true, sparse: true });

const Supplier = model<ISupplier>("Supplier", supplierSchema);
export default Supplier;