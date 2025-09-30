import 'dotenv/config';
import { CookieOptions } from 'express';
import ms from 'ms';

const config = {
  // Настройки сервера
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // Настройки базы данных
  database: {
    mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/weblarek',
  },

  // Настройки JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY,
    refreshExpiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRY,
  },

  // Настройки CORS
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  },

  // Настройки логгирования
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    logFiles: {
      requests: 'request.log',
      errors: 'error.log',
    },
  },

  // Настройка куки
  cookie: {
    name: 'refreshToken',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: ms((process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d') as ms.StringValue),
      path: '/',
    } as CookieOptions,
  },
};

export default config;
