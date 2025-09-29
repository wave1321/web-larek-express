import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import product, { IProduct } from '../models/product';
import BadRequestError from '../errors/badRequestError';
import InternalServerError from '../errors/internalServerError';

interface IOrderResponse {
  id: string,
  total: number,
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const postOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      payment, email, phone, address, total, items,
    } = req.body;

    if (!payment
      || !email
      || !phone
      || !address
      || total === undefined
      || !items) {
      return next(new BadRequestError('Missing order fields'));
    }

    const products: IProduct[] = await product.find({
      _id: {
        $in: items,
      },
    });

    if (products.length !== items.length) {
      return next(new BadRequestError('Some products cannot be found'));
    }

    const unavailableProducts = products.filter((p) => p.price === null);
    if (unavailableProducts.length > 0) {
      return next(new BadRequestError('Some products are not available for sale'));
    }

    if (!['card', 'online'].includes(payment)) {
      return next(new BadRequestError('Payment must be "card" or "online"'));
    }

    if (!isValidEmail(email)) {
      return next(new BadRequestError('Incorrect email'));
    }

    if (!phone || !address) {
      return next(new BadRequestError('Incomplete contact information'));
    }

    const calculatedTotal = products.reduce((sum, prod) => sum + (prod.price || 0), 0);

    if (calculatedTotal !== total) {
      return next(new BadRequestError('Total does not match the sum of the products'));
    }

    const orderId = faker.string.uuid();

    const orderResponse: IOrderResponse = {
      id: orderId,
      total: calculatedTotal,
    };

    return res.status(201).json(orderResponse);
  } catch (error) {
    return next(new InternalServerError());
  }
};

export default postOrder;
