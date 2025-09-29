import { CronJob } from 'cron';
import fs from 'fs/promises';
import path from 'path';
import InternalServerError from '../errors/internalServerError';

const TEMP_DIR = path.join(__dirname, 'public/images/temp');

// Функция для очистки старых временных файлов
export const cleanupTempFiles = async (
  maxAgeHours: number = 24,
): Promise<{ deleted: number; errors: number }> => {
  try {
    // Проверяем существует ли директория
    try {
      await fs.access(TEMP_DIR);
    } catch {
      return { deleted: 0, errors: 0 };
    }

    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();
    const MAX_AGE = maxAgeHours * 60 * 60 * 1000;

    const deletionResults = await Promise.all(
      files.map(async (file) => {
        try {
          const filePath = path.join(TEMP_DIR, file);
          const stats = await fs.stat(filePath);

          if (stats.isDirectory()) {
            return { success: false, reason: 'is_directory' };
          }

          const fileAge = now - stats.mtimeMs;

          if (fileAge > MAX_AGE) {
            await fs.unlink(filePath);
            return { success: true };
          }

          return { success: false, reason: 'not_old_enough' };
        } catch (error) {
          return { success: false, reason: 'error', error };
        }
      }),
    );

    const deletedCount = deletionResults.filter((result) => result.success).length;
    const errorCount = deletionResults.filter((result) => !result.success && result.reason === 'error').length;

    return { deleted: deletedCount, errors: errorCount };
  } catch (error) {
    throw new InternalServerError('Cleanup process failed');
  }
};

// Создаем cron job для ежедневной очистки в 3:00 ночи
export const cleanupJob = new CronJob(
  '0 3 * * *',
  async () => {
    try {
      await cleanupTempFiles(24);
      // Можно добавить логирование в файл если нужно
    } catch (error) {
      // Игнорируем ошибки в cron job чтобы он не падал
    }
  },
  null,
  false,
  'Europe/Moscow',
);
