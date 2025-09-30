import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import AppError from '../errors/appError';
import { HTTP_STATUS } from '../constants/httpStatus';

interface ErrorResponse {
  message: string,
}

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    (statusCode as number) = err.statusCode;
    message = err.message;
  } else if (err instanceof MongooseError.ValidationError) {
    (statusCode as number) = HTTP_STATUS.BAD_REQUEST;
    message = 'Data validation error';
  } else if (err instanceof MongooseError.CastError) {
    (statusCode as number) = HTTP_STATUS.BAD_REQUEST;
    message = 'Incorrect data format';
  }

  const errorResponse: ErrorResponse = { message };
  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
