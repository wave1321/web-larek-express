import { HTTP_STATUS } from '../constants/httpStatus';
import AppError from './appError';

class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

export default UnauthorizedError;
