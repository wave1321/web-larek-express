import { NextFunction, Request, Response } from 'express';
import InternalServerError from '../errors/internalServerError';
import Product from '../models/product';
import BadRequestError from '../errors/badRequestError';
import ConflictError from '../errors/conflictError';
import { deleteFile, moveFileToFinal } from './upload';
import NotFoundError from '../errors/notFoundError';
import { AuthRequest } from '../middlewares/auth';
import { HTTP_STATUS } from '../constants/httpStatus';

export const getProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({});

    if (!products || products.length === 0) {
      return next(new NotFoundError('No products found'));
    }

    return res.status(HTTP_STATUS.OK).json({
      items: products,
      success: true,
      count: products.length,
    });
  } catch (error: any) {
    return next(new InternalServerError('Error while receiving products'));
  }
};

export const postProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      title, description, image, category, price,
    } = req.body;

    if (!title || !description || !image || !category) {
      return next(new BadRequestError('Missing product fields'));
    }

    if (!image.fileName || !image.originalName) {
      return next(new BadRequestError('Missing image fields'));
    }

    // Обработка изображения (перемещение из временной папки)
    const finalImage = { ...image };
    if (image.fileName.includes('/temp/')) {
      const finalFileName = await moveFileToFinal(image.fileName);
      finalImage.fileName = finalFileName;
    }

    const newProduct = await Product.create({
      title,
      description,
      image: finalImage,
      category,
      price,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      ...newProduct.toObject(),

      success: true,
      message: 'Product created successfully',
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new ConflictError('A product with this name already exists'));
    }
    if (error.name === 'ValidationError') {
      return next(new BadRequestError('Validation error'));
    }
    return next(new InternalServerError());
  }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    // Находим текущий товар
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return next(new NotFoundError('Product not found'));
    }

    // Обработка нового изображения
    if (updateData.image?.fileName?.includes('/temp/')) {
      // Удаляем старый файл если он есть
      if (existingProduct.image?.fileName) {
        await deleteFile(existingProduct.image.fileName);
      }
      // Перемещаем новый файл
      updateData.image.fileName = await moveFileToFinal(updateData.image.fileName);
    }

    // Обновляем товар
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedProduct) {
      return next(new NotFoundError('Product not found after update'));
    }

    return res.status(HTTP_STATUS.OK).json({
      ...updatedProduct.toObject(),

      success: true,
      message: 'Product updated successfully',
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new ConflictError('A product with this name already exists'));
    }
    if (error.name === 'ValidationError') {
      return next(new BadRequestError('Validation error'));
    }
    if (error.name === 'CastError') {
      return next(new BadRequestError('Incorrect product ID'));
    }
    return next(new InternalServerError());
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return next(new NotFoundError('Product not found'));
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Product deleted successfully',
      data: deletedProduct,
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      return next(new BadRequestError('Invalid product ID'));
    }
    return next(new InternalServerError());
  }
};
