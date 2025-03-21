"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Регистрация нового пользователя (только для администраторов)
router.post('/register', auth_1.verifyToken, auth_1.verifyAdmin, async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        // Проверка, существует ли пользователь с таким именем или email
        const existingUser = await User_1.default.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким именем или email уже существует' });
        }
        // Создание нового пользователя
        const user = new User_1.default({
            username,
            email,
            password,
            role: role || 'user'
        });
        await user.save();
        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ message: 'Ошибка сервера при регистрации пользователя' });
    }
});
// Вход пользователя
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Поиск пользователя
        const user = await User_1.default.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
        }
        // Проверка, не заблокирован ли пользователь
        if (user.isLocked()) {
            const lockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(401).json({
                message: `Аккаунт временно заблокирован. Повторите через ${lockTime} минут`
            });
        }
        // Проверка пароля
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // Увеличиваем счетчик неудачных попыток
            await user.incrementLoginAttempts();
            // Если пользователь теперь заблокирован
            if (user.isLocked()) {
                const lockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
                return res.status(401).json({
                    message: `Слишком много неудачных попыток. Аккаунт заблокирован на ${lockTime} минут`
                });
            }
            return res.status(401).json({
                message: `Неверный пароль. Осталось попыток: ${5 - user.loginAttempts}`
            });
        }
        // Сброс счетчика неудачных попыток
        user.loginAttempts = 0;
        user.lockUntil = 0;
        await user.save();
        // Создание JWT токена
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username, role: user.role }, secret, { expiresIn: '24h' });
        res.status(200).json({
            message: 'Успешная аутентификация',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            expiresIn: 24 * 60 * 60 * 1000 // 24 часа в миллисекундах
        });
    }
    catch (error) {
        console.error('Ошибка при входе:', error);
        res.status(500).json({ message: 'Ошибка сервера при входе пользователя' });
    }
});
// Получение информации о текущем пользователе
router.get('/me', auth_1.verifyToken, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении данных пользователя' });
    }
});
// Изменение пароля
router.post('/change-password', auth_1.verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        // Проверка текущего пароля
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Текущий пароль неверен' });
        }
        // Обновление пароля
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Пароль успешно изменен' });
    }
    catch (error) {
        console.error('Ошибка при изменении пароля:', error);
        res.status(500).json({ message: 'Ошибка сервера при изменении пароля' });
    }
});
// Создание начального админа (только при первом запуске)
router.post('/init-admin', async (req, res) => {
    try {
        // Проверка, существуют ли уже пользователи с ролью admin
        const adminExists = await User_1.default.findOne({ role: 'admin' });
        if (adminExists) {
            return res.status(400).json({ message: 'Администратор уже существует' });
        }
        // Проверка специального ключа для создания админа
        const { initKey, username, email, password } = req.body;
        if (initKey !== process.env.ADMIN_INIT_KEY) {
            return res.status(401).json({ message: 'Недействительный ключ инициализации' });
        }
        // Создание администратора
        const admin = new User_1.default({
            username,
            email,
            password,
            role: 'admin'
        });
        await admin.save();
        res.status(201).json({
            message: 'Администратор успешно создан',
            user: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    }
    catch (error) {
        console.error('Ошибка при создании админа:', error);
        res.status(500).json({ message: 'Ошибка сервера при создании админа' });
    }
});
exports.default = router;
