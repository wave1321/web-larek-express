import { Request, Response, NextFunction } from 'express';
import NotFoundError from '../errors/notFoundError';

const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError('Route not found'));
};

export default notFoundHandler;
