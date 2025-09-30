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
    required: [true, 'The "title" field is required'],
    minlength: [2, 'The minimum length of the "title" field is 2'],
    maxlength: [20, 'The maximum length of the "title" field is 20'],
    unique: true,
  },
  image: {
    type: {
      fileName: String,
      originalName: String,
    },
    required: [true, 'The "image" field is required'],
  },
  category: {
    type: String,
    required: [true, 'The "category" field is required'],
  },
  description: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: [true, 'The "price" field is required'],
    default: null,
  },
});

productSchema.post('findOneAndDelete', async (doc) => {
  if (doc && doc.image && doc.image.fileName) {
    try {
      const { deleteFile } = await import('../controllers/upload');
      await deleteFile(doc.image.fileName);
    } catch (error) {
      throw new Error(`Error deleting product image: ${error}`);
    }
  }
});

export default mongoose.model<IProduct>('product', productSchema);
