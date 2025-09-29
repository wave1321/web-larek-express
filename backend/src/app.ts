import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { errors } from 'celebrate';
import errorHandler from './middlewares/errorHandler';
import notFoundHandler from './middlewares/notFoundHandler';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import authRouter from './routes/auth';
import uploadRouter from './routes/upload';
import { errorLogger, requestLogger } from './middlewares/logger';
import config from './config';
import { cleanupJob } from './utils/cleanup';

const app = express();

app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
  methods: config.cors.allowedMethods,
  allowedHeaders: config.cors.allowedHeaders,
}));

mongoose.connect(config.database.mongoUri);

cleanupJob.start();

app.use(requestLogger);

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/auth', authRouter);
app.use('/upload', uploadRouter);

app.use(errorLogger);

app.use(errors());
app.use(notFoundHandler);
app.use(errorHandler);

process.on('SIGINT', () => {
  cleanupJob.stop();
  process.exit(0);
});

app.listen(config.server.port, () => {});
