import { Joi } from 'celebrate';

export const productSchema = Joi.object({
  description: Joi.string().required().messages({
    'string.empty': 'Description is required',
    'any.required': 'Description is required',
  }),
  image: Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }).required(),
  title: Joi.string().required().messages({
    'string.empty': 'Title is required',
    'any.required': 'Title is required',
  }),
  category: Joi.string().required().messages({
    'string.empty': 'Category is required',
    'any.required': 'Category is required',
  }),
  price: Joi.number().allow(null).optional(),
});

export const productUpdateSchema = Joi.object({
  description: Joi.string().optional(),
  image: Joi.object({
    fileName: Joi.string().optional(),
    originalName: Joi.string().optional(),
  }).optional(),
  title: Joi.string().optional(),
  category: Joi.string().optional(),
  price: Joi.number().allow(null).optional(),
});

export const orderSchema = Joi.object({
  payment: Joi.string().valid('card', 'online').required().messages({
    'any.only': 'Payment must be "card" or "online"',
    'any.required': 'Payment is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),
  phone: Joi.string().required().messages({
    'any.required': 'Phone is required',
  }),
  address: Joi.string().min(1).required().messages({
    'string.empty': 'Address cannot be empty',
    'any.required': 'Address is required',
  }),
  total: Joi.number().min(0).required().messages({
    'number.min': 'Total must be a positive number',
    'any.required': 'Total is required',
  }),
  items: Joi.array().items(Joi.string().hex().length(24)).min(1).required()
    .messages({
      'array.min': 'Items must contain at least one product',
      'any.required': 'Items are required',
      'string.hex': 'Product ID must be a valid hex string',
      'string.length': 'Product ID must be 24 characters long',
    }),
});

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(30).optional(),
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must contain at least 6 characters',
    'any.required': 'Password is required',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'nvalid email format',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});
