import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { AuthRequest } from '../middlewares/auth';
import config from '../config';
import ConflictError from '../errors/conflictError';
import BadRequestError from '../errors/badRequestError';
import InternalServerError from '../errors/internalServerError';
import NotFoundError from '../errors/notFoundError';
import UnauthorizedError from '../errors/unauthorizedError';
import { HTTP_STATUS } from '../constants/httpStatus';

// Регистрация
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    // Проверяем существование пользователя
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ConflictError('User with this email already exists'));
    }

    // Хешируем пароль
    const hashedPassword = await hashPassword(password);

    // Создаем пользователя
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      tokens: [],
    });

    // Генерируем токены
    const accessToken = generateAccessToken({ _id: user._id.toString() });
    const refreshToken = generateRefreshToken({ _id: user._id.toString() });

    // Сохраняем refresh token в базе
    user.tokens.push({ token: refreshToken });
    await user.save();

    // Устанавливаем refresh token в куку
    res.cookie(
      config.cookie.name,
      refreshToken,
      config.cookie.options,
    );

    // Возвращаем ответ
    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
      },
      accessToken,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return next(new BadRequestError('Invalid data'));
    }
    return next(new InternalServerError());
  }
};

// Аутентификация
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Находим пользователя с паролем
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new UnauthorizedError('Incorrect email or password'));
    }

    // Проверяем пароль
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return next(new UnauthorizedError('Incorrect email or password'));
    }

    // Генерируем токены
    const accessToken = generateAccessToken({ _id: user._id.toString() });
    const refreshToken = generateRefreshToken({ _id: user._id.toString() });

    // Сохраняем refresh token в базе
    user.tokens.push({ token: refreshToken });
    await user.save();

    // Устанавливаем refresh token в куку
    res.cookie(
      config.cookie.name,
      refreshToken,
      config.cookie.options,
    );

    // Возвращаем ответ
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
      },
      accessToken,
    });
  } catch (error) {
    return next(new InternalServerError());
  }
};

// Получение текущего пользователя
export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { user } = req;

    if (!user) {
      return next(new NotFoundError('User not found'));
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return next(new InternalServerError());
  }
};

// Выход из системы
export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(new BadRequestError('Token not provided'));
    }

    const payload = verifyToken(refreshToken);
    const user = await User.findById(payload._id);

    if (!user) {
      return next(new NotFoundError('User not found'));
    }

    // Удаляем refresh token из базы
    user.tokens = user.tokens.filter((tokenObj) => tokenObj.token !== refreshToken);
    await user.save();

    // Очищаем куку
    res.clearCookie(config.cookie.name, {
      ...config.cookie.options,
      maxAge: 0,
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return next(new BadRequestError('Invalid token'));
    }
    return next(new InternalServerError());
  }
};

// Обновление токенов
export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(new UnauthorizedError('Refresh token not provided'));
    }

    const payload = verifyToken(refreshToken);
    const user = await User.findById(payload._id);

    if (!user) {
      return next(new NotFoundError('User not found'));
    }

    // Проверяем, что токен существует в базе
    const tokenExists = user.tokens.some((tokenObj) => tokenObj.token === refreshToken);
    if (!tokenExists) {
      return next(new UnauthorizedError('Invalid refresh token'));
    }

    // Генерируем новые токены
    const newAccessToken = generateAccessToken({ _id: user._id.toString() });
    const newRefreshToken = generateRefreshToken({ _id: user._id.toString() });

    // Обновляем refresh token в базе
    user.tokens = user.tokens.filter((tokenObj) => tokenObj.token !== refreshToken);
    user.tokens.push({ token: newRefreshToken });
    await user.save();

    // Устанавливаем новый refresh token в куку
    res.cookie(
      config.cookie.name,
      newRefreshToken,
      config.cookie.options,
    );

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
      },
      accessToken: newAccessToken,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid refresh token'));
    }
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Refresh token expired'));
    }
    return next(new InternalServerError());
  }
};
