import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import AppError from '../errors/appError';

interface ErrorResponse {
  message: string,
}

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = 'Data validation error';
  } else if (err instanceof MongooseError.CastError) {
    statusCode = 400;
    message = 'Incorrect data format';
  }

  const errorResponse: ErrorResponse = { message };
  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
