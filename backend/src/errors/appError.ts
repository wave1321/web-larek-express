import { HTTP_STATUS } from '../constants/httpStatus';

class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

export default AppError;
