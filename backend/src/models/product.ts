import mongoose, { Schema } from 'mongoose';

interface IImage {
  fileName: string,
  originalName: string
}

export interface IProduct {
  title: string,
  image: IImage,
  category: string,
  description: string,
  price: number | null
}

export const productSchema = new Schema<IProduct>({
  title: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 20,
    unique: true,
  },
  image: {
    type: {
      fileName: String,
      originalName: String,
    },
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: true,
    default: null,
  },
});

export default mongoose.model<IProduct>('product', productSchema);
