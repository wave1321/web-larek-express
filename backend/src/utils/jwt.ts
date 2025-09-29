import jwt from 'jsonwebtoken';
import config from '../config';

export interface TokenPayload {
  _id: string;
}

// Проверяем, что секретный ключ существует
const getJwtSecret = (): string => {
  const { secret } = config.jwt;
  if (!secret) {
    throw new Error('JWT secret is not defined');
  }
  return secret;
};

export const generateAccessToken = (payload: TokenPayload): string => {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, {
    expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = getJwtSecret();
  return jwt.verify(token, secret) as TokenPayload;
};
