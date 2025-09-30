import { HTTP_STATUS } from '../constants/httpStatus';
import AppError from './appError';

class BadRequestError extends AppError {
  constructor(message: string = 'Incorrect data sent') {
    super(message, HTTP_STATUS.BAD_REQUEST);
  }
}

export default BadRequestError;
