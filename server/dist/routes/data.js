"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DrugClassification_1 = __importDefault(require("../models/DrugClassification"));
const auth_1 = require("../middleware/auth");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
// Получение данных классификации для текущего пользователя
router.get('/', async (req, res) => {
    try {
        // Находим данные классификации для текущего пользователя
        let classification = await DrugClassification_1.default.findOne({ user: req.user.id });
        // Если данных нет, возвращаем пустой массив циклов
        if (!classification) {
            return res.json({ cycles: [] });
        }
        res.json({
            cycles: classification.cycles,
            lastModified: classification.lastModified,
            version: classification.version
        });
    }
    catch (error) {
        console.error('Ошибка при получении данных классификации:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении данных классификации' });
    }
});
// Сохранение данных классификации
router.post('/', async (req, res) => {
    try {
        const { cycles } = req.body;
        // Проверка наличия данных
        if (!cycles || !Array.isArray(cycles)) {
            return res.status(400).json({ message: 'Неверный формат данных' });
        }
        // Ищем существующую запись для пользователя
        let classification = await DrugClassification_1.default.findOne({ user: req.user.id });
        if (classification) {
            // Обновляем существующую запись
            classification.cycles = cycles;
            await classification.save();
        }
        else {
            // Создаем новую запись
            classification = new DrugClassification_1.default({
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
    }
    catch (error) {
        console.error('Ошибка при сохранении данных классификации:', error);
        res.status(500).json({ message: 'Ошибка сервера при сохранении данных классификации' });
    }
});
// Получение истории версий (только для администраторов)
router.get('/history', auth_1.verifyAdmin, async (req, res) => {
    try {
        const userId = req.query.userId || req.user.id;
        // Находим данные классификации для указанного пользователя
        const classification = await DrugClassification_1.default.findOne({ user: userId });
        if (!classification) {
            return res.status(404).json({ message: 'Данные классификации не найдены' });
        }
        res.json({
            lastModified: classification.lastModified,
            version: classification.version
        });
    }
    catch (error) {
        console.error('Ошибка при получении истории версий:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении истории версий' });
    }
});
// Импорт данных (только для администраторов)
router.post('/import', auth_1.verifyAdmin, async (req, res) => {
    try {
        const { userId, cycles } = req.body;
        // Проверка наличия данных
        if (!userId || !cycles || !Array.isArray(cycles)) {
            return res.status(400).json({ message: 'Неверный формат данных' });
        }
        // Ищем существующую запись для указанного пользователя
        let classification = await DrugClassification_1.default.findOne({ user: userId });
        if (classification) {
            // Обновляем существующую запись
            classification.cycles = cycles;
            await classification.save();
        }
        else {
            // Создаем новую запись
            classification = new DrugClassification_1.default({
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
    }
    catch (error) {
        console.error('Ошибка при импорте данных классификации:', error);
        res.status(500).json({ message: 'Ошибка сервера при импорте данных классификации' });
    }
});
// Сохранение данных в файл data-backup.json в корне проекта
router.post('/save-to-root-file', async (req, res) => {
    try {
        const { cycles } = req.body;
        // Проверка наличия данных
        if (!cycles || !Array.isArray(cycles)) {
            return res.status(400).json({ message: 'Неверный формат данных' });
        }
        // Путь к файлу data-backup.json в корне проекта (исправленный путь)
        const rootPath = path_1.default.resolve(__dirname, '../../..');
        const filePath = path_1.default.join(rootPath, 'data-backup.json');
        console.log('Сохранение данных в файл:', filePath);
        console.log('Текущая директория:', __dirname);
        console.log('Корневая директория проекта:', rootPath);
        // Создаем объект с данными для сохранения
        const dataToSave = {
            cycles,
            lastSaved: new Date().toISOString()
        };
        // Записываем данные в файл
        fs_1.default.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), 'utf8');
        console.log('Данные успешно записаны в файл');
        res.json({
            message: 'Данные успешно сохранены в файл data-backup.json',
            path: filePath
        });
    }
    catch (error) {
        console.error('Ошибка при сохранении данных в файл:', error);
        res.status(500).json({ message: 'Ошибка сервера при сохранении данных в файл' });
    }
});
exports.default = router;
