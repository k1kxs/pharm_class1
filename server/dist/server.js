"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const data_1 = __importDefault(require("./routes/data"));
const pdf_1 = __importDefault(require("./routes/pdf"));
const auth_2 = require("./middleware/auth");
// Загрузка переменных окружения
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Подключение к MongoDB
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drug-classification')
    .then(() => {
    console.log('Подключено к MongoDB');
})
    .catch((error) => {
    console.error('Ошибка подключения к MongoDB:', error);
});
// Маршруты
app.use('/api/auth', auth_1.default);
app.use('/api/data', auth_2.verifyToken, data_1.default); // Защищенные маршруты с проверкой токена
app.use('/api/pdf', pdf_1.default); // Маршрут для генерации PDF
// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
