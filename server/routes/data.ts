import express, { Request, Response } from 'express';
import DrugClassification, { IDrugClassification } from '../models/DrugClassification';
import { verifyAdmin } from '../middleware/auth';

const router = express.Router();

// Получение данных классификации для текущего пользователя
router.get('/', async (req: Request, res: Response) => {
  try {
    // Находим данные классификации для текущего пользователя
    let classification = await DrugClassification.findOne({ user: req.user.id });
    
    // Если данных нет, возвращаем пустой массив циклов
    if (!classification) {
      return res.json({ cycles: [] });
    }
    
    res.json({
      cycles: classification.cycles,
      lastModified: classification.lastModified,
      version: classification.version
    });
  } catch (error) {
    console.error('Ошибка при получении данных классификации:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении данных классификации' });
  }
});

// Сохранение данных классификации
router.post('/', async (req: Request, res: Response) => {
  try {
    const { cycles } = req.body;
    
    // Проверка наличия данных
    if (!cycles || !Array.isArray(cycles)) {
      return res.status(400).json({ message: 'Неверный формат данных' });
    }
    
    // Ищем существующую запись для пользователя
    let classification = await DrugClassification.findOne({ user: req.user.id });
    
    if (classification) {
      // Обновляем существующую запись
      classification.cycles = cycles;
      await classification.save();
    } else {
      // Создаем новую запись
      classification = new DrugClassification({
        user: req.user.id,
        cycles
      });
      await classification.save();
    }
    
    res.json({
      message: 'Данные классификации успешно сохранены',
      lastModified: classification.lastModified,
      version: classification.version
    });
  } catch (error) {
    console.error('Ошибка при сохранении данных классификации:', error);
    res.status(500).json({ message: 'Ошибка сервера при сохранении данных классификации' });
  }
});

// Получение истории версий (только для администраторов)
router.get('/history', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId || req.user.id;
    
    // Находим данные классификации для указанного пользователя
    const classification = await DrugClassification.findOne({ user: userId });
    
    if (!classification) {
      return res.status(404).json({ message: 'Данные классификации не найдены' });
    }
    
    res.json({
      lastModified: classification.lastModified,
      version: classification.version
    });
  } catch (error) {
    console.error('Ошибка при получении истории версий:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении истории версий' });
  }
});

// Импорт данных (только для администраторов)
router.post('/import', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { userId, cycles } = req.body;
    
    // Проверка наличия данных
    if (!userId || !cycles || !Array.isArray(cycles)) {
      return res.status(400).json({ message: 'Неверный формат данных' });
    }
    
    // Ищем существующую запись для указанного пользователя
    let classification = await DrugClassification.findOne({ user: userId });
    
    if (classification) {
      // Обновляем существующую запись
      classification.cycles = cycles;
      await classification.save();
    } else {
      // Создаем новую запись
      classification = new DrugClassification({
        user: userId,
        cycles
      });
      await classification.save();
    }
    
    res.json({
      message: 'Данные классификации успешно импортированы',
      lastModified: classification.lastModified,
      version: classification.version
    });
  } catch (error) {
    console.error('Ошибка при импорте данных классификации:', error);
    res.status(500).json({ message: 'Ошибка сервера при импорте данных классификации' });
  }
});

export default router; 