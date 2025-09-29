import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import product, { IProduct } from '../models/product';
import BadRequestError from '../errors/badRequestError';
import InternalServerError from '../errors/internalServerError';

interface IOrder {
  payment: string;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

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
    const orderJSON = {
      payment: 'card', // card || online
      email: 'admin@ya.ru',
      phone: '+7999999999',
      address: 'test',
      total: 4200,
      items: [
        '662e97d0c2fed29cab5bf3db', // id товара
        '662e97dec2fed29cab5bf3dd',
      ],
    };

    const orderData: IOrder = req.body.email ? req.body : orderJSON;

    if (!orderData.payment
      || !orderData.email
      || !orderData.phone
      || !orderData.address
      || orderData.total === undefined
      || !orderData.items) {
      return next(new BadRequestError('Missing order fields'));
    }

    const products: IProduct[] = await product.find({
      _id: {
        $in: orderData.items,
      },
    });

    if (products.length !== orderData.items.length) {
      return next(new BadRequestError('Some products cannot be found'));
    }

    const unavailableProducts = products.filter((p) => p.price === null);
    if (unavailableProducts.length > 0) {
      return next(new BadRequestError('Some products are not available for sale'));
    }

    if (!['card', 'online'].includes(orderData.payment)) {
      return next(new BadRequestError('Payment must be "card" or "online"'));
    }

    if (!isValidEmail(orderData.email)) {
      return next(new BadRequestError('Incorrect email'));
    }

    if (!orderData.phone || !orderData.address) {
      return next(new BadRequestError('Incomplete contact information'));
    }

    const calculatedTotal = products.reduce((sum, prod) => sum + (prod.price || 0), 0);

    if (calculatedTotal !== orderData.total) {
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
