import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stripePriceId?: string;
  stripeProductId?: string;
  category: string;
  tags: string[];
  images: string[];
  features: string[];
  stock: number;
  sku: string;
  isActive: boolean;
  isFree: boolean;
  billingType: 'one_time' | 'recurring';
  billingInterval?: 'day' | 'week' | 'month' | 'year';
  billingIntervalCount?: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stripePriceId: {
      type: String,
      sparse: true,
      index: true,
    },
    stripeProductId: {
      type: String,
      sparse: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
    features: [
      {
        type: String,
      },
    ],
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFree: {
      type: Boolean,
      default: false,
      index: true,
    },
    billingType: {
      type: String,
      enum: ['one_time', 'recurring'],
      required: function () {
        return !this.isFree;
      },
      default: 'recurring',
    },
    billingInterval: {
      type: String,
      enum: ['day', 'week', 'month', 'year'],
      required: function () {
        return !this.isFree && this.billingType === 'recurring';
      },
    },
    billingIntervalCount: {
      type: Number,
      min: 1,
      default: 1,
      required: function () {
        return !this.isFree && this.billingType === 'recurring';
      },
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ price: 1, category: 1 });
productSchema.index({ tags: 1 });

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;
