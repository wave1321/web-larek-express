import { HTTP_STATUS } from '../constants/httpStatus';
import AppError from './appError';

class ConflictError extends AppError {
  constructor(message: string = 'Data conflict') {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

export default ConflictError;
