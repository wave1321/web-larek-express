import AppError from './appError';

class ConflictError extends AppError {
  constructor(message: string = 'Data conflict') {
    super(message, 409);
  }
}

export default ConflictError;
