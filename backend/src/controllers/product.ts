import { NextFunction, Request, Response } from 'express';

import InternalServerError from '../errors/internalServerError';
import Product, { IProduct } from '../models/product';
import BadRequestError from '../errors/badRequestError';
import ConflictError from '../errors/conflictError';

export const getProducts = (_req: Request, res: Response, next: NextFunction) => {
  Product.find({})
    .then((products: IProduct[]) => res.send({
      items: products,
      total: products.length,
    }))
    .catch((_err: any) => {
      next(new InternalServerError('Error while receiving products'));
    });
};

export const postProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productJSON = {
      description: 'Будет стоять над душой и не давать прокрастинировать.',
      image: {
        fileName: '/images/Asterisk_2.png',
        originalName: 'Asterisk_2.png',
      },
      title: 'Мамка-таймер',
      category: 'софт-скил',
      price: null,
    };

    const productData: IProduct = req.body.description ? req.body : productJSON;

    if (!productData.title
      || !productData.description
      || !productData.image
      || !productData.category) {
      return next(new BadRequestError('Missing product fields'));
    }

    if (!productData.image.fileName || !productData.image.originalName) {
      return next(new BadRequestError('Missing image fields'));
    }

    const newProduct: IProduct = await Product.create(productData);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('E11000')) {
      return next(new ConflictError('A product with this name already exists'));
    }
    return next(new InternalServerError());
  }
};
