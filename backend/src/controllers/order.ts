import { Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import product, { IProduct } from '../models/product';

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

const postOrder = async (req: Request, res: Response) => {
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
      return res.status(400).json({
        success: false,
        message: 'Missing order fields',
      });
    }

    const products: IProduct[] = await product.find({
      _id: {
        $in: orderData.items,
      },
    });

    if (products.length !== orderData.items.length) {
      return res.status(400).json({
        success: false,
        message: 'Some products cannot be found',
      });
    }

    const unavailableProducts = products.filter((p) => p.price === null);
    if (unavailableProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some products are not available for sale',
      });
    }

    if (!['card', 'online'].includes(orderData.payment)) {
      return res.status(400).json({
        success: false,
        message: 'Payment must be "card" or "online"',
      });
    }

    if (!isValidEmail(orderData.email)) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect email',
      });
    }

    if (!orderData.phone || !orderData.address) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete contact information',
      });
    }

    const calculatedTotal = products.reduce((sum, prod) => sum + (prod.price || 0), 0);

    if (calculatedTotal !== orderData.total) {
      return res.status(400).json({
        success: false,
        message: 'Total does not match the sum of the products',
      });
    }

    const orderId = faker.string.uuid();

    const orderResponse: IOrderResponse = {
      id: orderId,
      total: calculatedTotal,
    };

    return res.status(201).json(orderResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export default postOrder;
