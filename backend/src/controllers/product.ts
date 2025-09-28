import { Request, Response } from 'express';

import Product, { IProduct } from '../models/product';

export const getProducts = (_req: Request, res: Response) => {
  Product.find({})
    .then((products: IProduct[]) => res.send({
      items: products,
      total: products.length,
    }))
    .catch((err: any) => res.status(400).json(`Error: ${err}`));
};

export const postProducts = async (req: Request, res: Response) => {
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
      return res.status(400).json({
        success: false,
        message: 'Missing product fields',
      });
    }

    if (!productData.image.fileName || !productData.image.originalName) {
      return res.status(400).json({
        success: false,
        message: 'Missing image fields',
      });
    }

    const newProduct: IProduct = await Product.create(productData);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
