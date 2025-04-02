import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import dataRoutes from './routes/data';
import pdfRoutes from './routes/pdf';
import { verifyToken } from './middleware/auth';

// Загрузка переменных окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drug-classification')
  .then(() => {
    console.log('Подключено к MongoDB');
  })
  .catch((error) => {
    console.error('Ошибка подключения к MongoDB:', error);
  });

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/data', verifyToken, dataRoutes); // Защищенные маршруты с проверкой токена
app.use('/api/pdf', pdfRoutes); // Маршрут для генерации PDF

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 