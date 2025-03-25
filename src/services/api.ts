import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

// Базовый URL API (из переменных окружения или по умолчанию)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
      // Получение данных из localStorage вместо сервера
      const localData = localStorage.getItem('drug_classification_data');
      if (localData) {
        return JSON.parse(localData);
      }
      return { cycles: [] };
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      return { cycles: [] };
    }
  },
  
  saveData: async (cycles: any[]) => {
    try {
      // Сохранение данных в localStorage вместо сервера
      localStorage.setItem('drug_classification_data', JSON.stringify({ cycles }));
      return { message: 'Данные успешно сохранены' };
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
      throw new Error('Не удалось сохранить данные');
    }
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