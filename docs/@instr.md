# Подробная инструкция по использованию

## Шаг 1: Локальная разработка

1. **Установка необходимых инструментов**:
   ```bash
   # Установка Node.js и npm (если еще не установлены)
   # Windows: скачайте с https://nodejs.org/
   # Linux:
   sudo apt update
   sudo apt install nodejs npm
   
   # Установка PostgreSQL
   # Windows: скачайте с https://www.postgresql.org/download/windows/
   # Linux:
   sudo apt install postgresql postgresql-contrib
   
   # Запуск PostgreSQL
   # Windows: через сервисы Windows
   # Linux:
   sudo systemctl start postgresql
   ```

2. **Создание базы данных**:
   ```bash
   # Windows через psql (замените 'postgres' на ваше имя пользователя)
   psql -U postgres
   
   # Linux
   sudo -u postgres psql
   
   # В psql:
   CREATE DATABASE drug_classification;
   \q
   ```

3. **Настройка .env файла**:
   ```
   DATABASE_URL="postgresql://postgres:ваш_пароль@localhost:5432/drug_classification"
   JWT_SECRET="ваш_секретный_ключ_jwt"
   PORT=5001
   NODE_ENV=development
   ```

4. **Инициализация базы данных**:
   ```bash
   # Установка prisma глобально
   npm install -g prisma
   
   # Создание таблиц и применение миграций
   npx prisma migrate dev --name init
   
   # Заполнение начальными данными
   npm run seed
   ```

5. **Запуск бэкенда**:
   ```bash
   # В режиме разработки
   npm run dev
   ```

6. **Тестирование API**:
   Используйте Postman или Thunder Client в VS Code для тестирования API:
   - `POST http://localhost:5001/api/auth/login` с телом `{"username": "admin", "password": "admin123"}`
   - `GET http://localhost:5001/api/data` с заголовком Authorization: Bearer полученный_токен
   - и т.д.

## Шаг 2: Настройка фронтенда для работы с бэкендом

1. **Обновление .env файла фронтенда**:
   ```
   REACT_APP_API_URL=http://localhost:5001/api
   ```

2. **Запуск фронтенда**:
   ```bash
   npm start
   ```

3. **Тестирование**:
   - Войдите в систему с логином `admin` и паролем `admin123`
   - Проверьте создание, редактирование и удаление циклов, групп и т.д.
   - Проверьте функциональность резервного копирования
   - Проверьте экспорт в PDF

## Шаг 3: Создание бэкенда через Cursor

### Шаг 1: Инициализация проекта

**Промт для Cursor:**
```
Создай новый проект бэкенда на Node.js с Express и TypeScript для моего приложения классификации лекарств. Мне нужна основная структура проекта со следующими элементами:

1. package.json с необходимыми зависимостями (express, typescript, prisma, jsonwebtoken, bcrypt, cors)
2. tsconfig.json для настройки TypeScript
3. Базовая структура папок (src/controllers, src/middleware, src/routes, src/services, src/utils, prisma)
4. Основной файл приложения src/index.ts

Я хочу чтобы проект был современным и использовал лучшие практики разработки.
```

### Шаг 2: Настройка Prisma и моделей данных

**Промт для Cursor:**
```
Добавь настройку Prisma ORM для работы с PostgreSQL. Я хочу создать следующие модели данных:

1. User - модель пользователя с полями id, username, email, password, role (admin/user)
2. Cycle - модель циклов классификации с полями id, name, userId, createdAt, updatedAt
3. Group - модель групп с полями id, name, color, order, cycleId
4. Subgroup - модель подгрупп с полями id, name, order, groupId
5. Category - модель категорий с полями id, name, order, subgroupId
6. Drug - модель лекарств с полями id, name, order, categoryId
7. History - для отслеживания действий пользователей с полями id, userId, action, description, cycleId, createdAt
8. Backup - модель для резервных копий с полями id, name, data (JSONB тип для хранения всех данных), userId, createdAt

Настрой связи между этими моделями (один-ко-многим где необходимо) и добавь каскадное удаление, чтобы при удалении цикла удалялись все связанные с ним данные.
```

### Шаг 3: Настройка аутентификации и авторизации

**Промт для Cursor:**
```
Создай систему аутентификации и авторизации с JWT токенами. Мне нужны:

1. Middleware для проверки авторизации (src/middleware/auth.ts)
2. Утилиты для работы с JWT (src/utils/jwt.ts)
3. Контроллер аутентификации (src/controllers/auth.controller.ts) с методами:
   - login - вход в систему (проверка пароля, генерация токена)
   - getCurrentUser - получение текущего пользователя
   - changePassword - изменение пароля

4. Маршруты для аутентификации (src/routes/auth.ts):
   - POST /api/auth/login
   - GET /api/auth/me
   - POST /api/auth/change-password

Важно, чтобы система была безопасной и следовала современным практикам.
```

### Шаг 4: API для работы с данными классификации

**Промт для Cursor:**
```
Создай API для работы с данными классификации лекарств. Мне нужны:

1. Контроллер данных (src/controllers/data.controller.ts) с методами:
   - getData - получение всех циклов, групп, подгрупп, категорий и лекарств пользователя
   - saveData - сохранение данных (обновление или создание)
   - getHistory - получение истории изменений (только для админа)

2. Сервис для работы с данными (src/services/data.service.ts)

3. Маршруты (src/routes/data.ts):
   - GET /api/data - получение данных
   - POST /api/data - сохранение данных
   - GET /api/data/history - получение истории изменений

Добавь валидацию входных данных и обработку ошибок. При сохранении данных нужно записывать действие в историю.
```

### Шаг 5: API для работы с резервными копиями

**Промт для Cursor:**
```
Я добавил в мой проект функционал резервного копирования. Создай API для работы с резервными копиями:

1. Контроллер резервных копий (src/controllers/backup.controller.ts) с методами:
   - getBackups - получение списка резервных копий пользователя
   - createBackup - создание новой резервной копии
   - restoreBackup - восстановление данных из резервной копии
   - deleteBackup - удаление резервной копии

2. Сервис для работы с резервными копиями (src/services/backup.service.ts)

3. Маршруты (src/routes/backup.ts):
   - GET /api/backup - получение списка резервных копий
   - POST /api/backup - создание новой резервной копии
   - POST /api/backup/:id/restore - восстановление из резервной копии
   - DELETE /api/backup/:id - удаление резервной копии

Резервная копия должна сохранять все данные пользователя (циклы, группы, подгруппы, категории, лекарства) в поле data модели Backup. Также при восстановлении запись должна добавляться в историю.
```

### Шаг 6: Экспорт PDF

**Промт для Cursor:**
```
Создай функциональность для экспорта данных в PDF формат:

1. Контроллер экспорта (src/controllers/export.controller.ts) с методом:
   - exportPdf - экспорт данных цикла в PDF

2. Сервис для экспорта (src/services/export.service.ts)

3. Маршрут (src/routes/export.ts):
   - POST /api/export/pdf - экспорт данных в PDF

Используй библиотеку PDFKit для генерации PDF файлов. PDF должен содержать все данные о цикле, группах, подгруппах, категориях и лекарствах в табличном формате.
```

### Шаг 7: Настройка безопасности и CORS

**Промт для Cursor:**
```
Настрой безопасность приложения и CORS для работы с фронтендом:

1. Добавь настройку CORS в файл src/index.ts, чтобы фронтенд мог делать запросы к API
2. Добавь middleware для защиты от основных атак (helmet)
3. Настрой ограничение количества запросов (rate limiting)
4. Добавь логирование запросов
5. Создай middleware для обработки ошибок
```

### Шаг 8: Обновление фронтенда для работы с бэкендом

**Промт для Cursor:**
```
Обнови файл src/services/api.ts на фронтенде для работы с новым бэкендом:

1. Настрой базовый URL API в axios-клиенте
2. Замени временные функции в authAPI на реальные API-запросы
3. Замени временные функции в dataAPI на реальные API-запросы
4. Замени временные функции в backupAPI на реальные API-запросы
5. Добавь функции для экспорта PDF
6. Настрой обработку ошибок и повторные попытки при сбоях

Код должен быть совместим с текущим интерфейсом, чтобы минимизировать изменения в остальных частях приложения.
```

## Шаг 4: Деплой в Yandex Cloud

1. **Создание базы данных в Yandex Cloud**:
   - Зарегистрируйтесь в Yandex Cloud (https://cloud.yandex.ru/)
   - Создайте сервис Managed Service for PostgreSQL
   - Получите строку подключения

2. **Деплой бэкенда**:
   - Выберите один из способов:
     - Yandex Cloud Functions (для небольших приложений)
     - Yandex Managed Service for Docker (для более сложных приложений)
     - Yandex Compute Engine (для полного контроля)

3. **Обновление переменных окружения**:
   ```
   DATABASE_URL="postgresql://имя_пользователя:пароль@хост:порт/база_данных"
   JWT_SECRET="ваш_секретный_ключ"
   PORT=5001
   NODE_ENV=production
   ```

4. **Миграция базы данных**:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

5. **Настройка фронтенда для продакшена**:
   - Обновите .env файл с новым URL API
   - Соберите фронтенд: `npm run build`
   - Разместите статические файлы на Yandex Object Storage или другом сервисе 