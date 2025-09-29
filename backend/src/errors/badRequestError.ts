import AppError from './appError';

class BadRequestError extends AppError {
  constructor(message: string = 'Incorrect data sent') {
    super(message, 400);
  }
}

export default BadRequestError;
