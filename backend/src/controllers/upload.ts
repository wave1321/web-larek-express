import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs/promises';
import BadRequestError from '../errors/badRequestError';
import InternalServerError from '../errors/internalServerError';
import { HTTP_STATUS } from '../constants/httpStatus';

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new BadRequestError('No file uploaded'));
    }

    const response = {
      fileName: `/images/temp/${req.file.filename}`,
      originalName: req.file.originalname,
    };

    return res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    return next(new InternalServerError());
  }
};

// Функция для перемещения файла из временной в постоянную папку
export const moveFileToFinal = async (tempFileName: string): Promise<string> => {
  try {
    const tempPath = path.join(__dirname, '../public/images/temp', path.basename(tempFileName));
    const finalFileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(tempFileName)}`;
    const finalPath = path.join(__dirname, '../public/images', finalFileName);

    await fs.rename(tempPath, finalPath);
    return `/images/${finalFileName}`;
  } catch (error) {
    throw new InternalServerError('Failed to move file');
  }
};

// Функция для удаления файла
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullPath = path.join(__dirname, '../public', relativePath);
    await fs.unlink(fullPath);
  } catch (error) {
    throw new InternalServerError('Failed to delete file');
  }
};
