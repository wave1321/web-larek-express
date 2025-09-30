import { HTTP_STATUS } from '../constants/httpStatus';
import AppError from './appError';

class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export default InternalServerError;
