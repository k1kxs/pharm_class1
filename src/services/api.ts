import axios from 'axios';

// Базовый URL API (из переменных окружения или по умолчанию)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
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
        localStorage.removeItem('user');
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

// API для аутентификации
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    // Сохраняем токен и данные пользователя в localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
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
    const response = await api.get('/data');
    return response.data;
  },
  
  saveData: async (cycles: any[]) => {
    const response = await api.post('/data', { cycles });
    return response.data;
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