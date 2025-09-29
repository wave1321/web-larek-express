import { celebrate, Joi, Segments } from 'celebrate';
import {
  loginSchema,
  orderSchema,
  productSchema,
  productUpdateSchema,
  registerSchema,
} from '../validation/schemas';

export const validateProduct = celebrate({
  [Segments.BODY]: productSchema,
});

export const validateProductUpdate = celebrate({
  [Segments.BODY]: productUpdateSchema,
});

export const validateOrder = celebrate({
  [Segments.BODY]: orderSchema,
});

export const validateId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
});

export const validateRegister = celebrate({
  [Segments.BODY]: registerSchema,
});

export const validateLogin = celebrate({
  [Segments.BODY]: loginSchema,
});
