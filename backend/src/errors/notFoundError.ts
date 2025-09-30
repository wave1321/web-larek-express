import { HTTP_STATUS } from '../constants/httpStatus';
import AppError from './appError';

class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

export default NotFoundError;
