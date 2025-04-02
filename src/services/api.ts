import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

// Базовый URL API (из переменных окружения или по умолчанию)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для обработки ошибок ответа
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если токен истек или недействителен, выходим из системы
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Проверяем, что это не запрос на вход, чтобы избежать циклических редиректов
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API для аутентификации
export const authAPI = {
  login: async (username: string, password: string) => {
    // Проверяем пароль
    if (password !== 'admin123') {
      throw new Error('Неверный пароль');
    }
    
    // Создаем фиктивный ответ
    const mockResponse = {
      data: {
        message: 'Успешная аутентификация',
        token: 'mock-token-for-testing',
        user: {
          id: '1',
          username: username || 'admin',
          email: 'admin@example.com',
          role: 'admin'
        },
        expiresIn: 24 * 60 * 60 * 1000 // 24 часа в миллисекундах
      }
    };
    
    // Сохраняем токен и данные пользователя в localStorage
    localStorage.setItem('token', mockResponse.data.token);
    localStorage.setItem('user', JSON.stringify(mockResponse.data.user));
    
    return mockResponse.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
  
  // Только для администраторов
  registerUser: async (userData: { username: string; email: string; password: string; role?: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};

// API для работы с данными классификации
export const dataAPI = {
  getData: async () => {
    try {
      // Оптимизированное получение данных из localStorage
      const cacheKey = 'drug_classification_data';

      // Используем мемоизированное значение при повторных вызовах в одной сессии
      if ((dataAPI as any)._cachedData) {
        return (dataAPI as any)._cachedData;
      }

      // Чтение данных из localStorage одним вызовом
      const localData = localStorage.getItem(cacheKey);
      
      if (localData) {
        // Парсинг данных выполняем только если они есть
        const parsedData = JSON.parse(localData);
        // Сохраняем в памяти для последующих вызовов
        (dataAPI as any)._cachedData = parsedData;
        return parsedData;
      }
      
      // Возвращаем пустой объект, если данных нет
      return { cycles: [] };
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      return { cycles: [] };
    }
  },
  
  saveData: async (cycles: any[]) => {
    try {
      // Оптимизированное сохранение данных в localStorage
      const cacheKey = 'drug_classification_data';
      const data = { cycles };
      
      // Сериализуем JSON только один раз
      const jsonData = JSON.stringify(data);
      
      // Обновляем локальный кэш в памяти
      (dataAPI as any)._cachedData = data;
      
      // Записываем в localStorage
      localStorage.setItem(cacheKey, jsonData);
      
      return { message: 'Данные успешно сохранены' };
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
      throw new Error('Не удалось сохранить данные');
    }
  },
  
  // Очистка кэша в памяти
  clearCache: () => {
    (dataAPI as any)._cachedData = null;
  },
  
  // Только для администраторов
  getHistory: async (userId?: string) => {
    const params = userId ? { userId } : {};
    const response = await api.get('/data/history', { params });
    return response.data;
  },
  
  // Только для администраторов
  importData: async (userId: string, cycles: any[]) => {
    const response = await api.post('/data/import', { userId, cycles });
    return response.data;
  }
};

export default api; 