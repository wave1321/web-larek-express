import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import productRouter from './routes/product';
import orderRouter from './routes/order';

const app = express();
app.use(cors());

const { PORT } = process.env;

mongoose.connect('mongodb://127.0.0.1:27017/weblarek');

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/product', productRouter);
app.use('/order', orderRouter);

app.listen(PORT, () => {});
