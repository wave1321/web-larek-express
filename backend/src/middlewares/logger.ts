import winston from 'winston';
import expressWinston from 'express-winston';
import config from '../config';

export const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({ filename: config.logging.logFiles.requests }),
  ],
  format: winston.format.json(),
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: false,
  meta: true,
  requestWhitelist: ['url', 'method', 'headers', 'query', 'body'],
  responseWhitelist: ['statusCode', 'body'],
  bodyBlacklist: ['password'],
  ignoreRoute: (_req, _res) => false,
});

export const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({ filename: config.logging.logFiles.errors }),
  ],
  format: winston.format.json(),
  meta: true,
  msg: 'Error: {{err.message}}',
  requestWhitelist: ['url', 'method', 'headers', 'query', 'body'],
});
