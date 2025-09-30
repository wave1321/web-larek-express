import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/user';
import UnauthorizedError from '../errors/unauthorizedError';
import NotFoundError from '../errors/notFoundError';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return next(new UnauthorizedError('Token not provided'));
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload._id);

    if (!user) {
      return next(new NotFoundError('User not found'));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid token'));
  }
};
