import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

// Вместо реального API будем использовать LocalStorage
// в будущем этот файл будет модифицирован для работы с настоящим бэкендом
const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  DATA: 'drug_classification_data',
  BACKUPS: 'drug_classification_backups'
};

// API для аутентификации - временная реализация на фронтенде
export const authAPI = {
  login: async (username: string, password: string) => {
    // Временная реализация для фронтенда
    // В будущем будет заменено на реальные API-запросы
    if (password !== 'admin123') {
      throw new Error('Неверный пароль');
    }
    
    // Создаем фиктивный ответ
    const mockResponse = {
      message: 'Успешная аутентификация',
      token: 'mock-token-for-testing',
      user: {
        id: '1',
        username: username || 'admin',
        email: 'admin@example.com',
        role: 'admin'
      },
      expiresIn: 24 * 60 * 60 * 1000 // 24 часа в миллисекундах
    };
    
    // Сохраняем токен и данные пользователя в localStorage
    localStorage.setItem(STORAGE_KEYS.TOKEN, mockResponse.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockResponse.user));
    
    return mockResponse;
  },
  
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
  
  getCurrentUser: async () => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) {
      throw new Error('Пользователь не аутентифицирован');
    }
    return JSON.parse(userStr);
  },
  
  // В будущей реализации это будет отправлять запрос на API
  changePassword: async (currentPassword: string, newPassword: string) => {
    if (currentPassword !== 'admin123') {
      throw new Error('Текущий пароль неверен');
    }
    return { message: 'Пароль успешно изменен' };
  }
};

// API для работы с данными классификации - временная реализация на фронтенде
export const dataAPI = {
  getData: async () => {
    try {
      // Используем мемоизированное значение при повторных вызовах в одной сессии
      if ((dataAPI as any)._cachedData) {
        return (dataAPI as any)._cachedData;
      }

      // Чтение данных из localStorage
      const localData = localStorage.getItem(STORAGE_KEYS.DATA);
      
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
      const data = { cycles };
      
      // Сериализуем JSON только один раз
      const jsonData = JSON.stringify(data);
      
      // Обновляем локальный кэш в памяти
      (dataAPI as any)._cachedData = data;
      
      // Записываем в localStorage
      localStorage.setItem(STORAGE_KEYS.DATA, jsonData);
      
      return { message: 'Данные успешно сохранены' };
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
      throw new Error('Не удалось сохранить данные');
    }
  },
  
  // Очистка кэша в памяти
  clearCache: () => {
    (dataAPI as any)._cachedData = null;
  }
};

// API для работы с резервными копиями - временная реализация на фронтенде
export const backupAPI = {
  getBackups: async (): Promise<any[]> => {
    try {
      const backupsStr = localStorage.getItem(STORAGE_KEYS.BACKUPS);
      if (!backupsStr) return [];
      
      const backups = JSON.parse(backupsStr);
      return Array.isArray(backups) ? backups : [];
    } catch (error) {
      console.error('Ошибка при получении резервных копий:', error);
      return [];
    }
  },
  
  createBackup: async (name?: string): Promise<void> => {
    try {
      // Получаем текущие данные
      const currentData = (dataAPI as any)._cachedData || 
        JSON.parse(localStorage.getItem(STORAGE_KEYS.DATA) || '{"cycles": []}');
      
      // Получаем существующие резервные копии
      const existingBackups = await backupAPI.getBackups();
      
      // Создаем новую резервную копию
      const newBackup = {
        id: Date.now().toString(),
        name: name || `Резервная копия от ${new Date().toLocaleString()}`,
        date: Date.now(),
        data: currentData
      };
      
      // Добавляем новую копию и сохраняем
      const updatedBackups = [newBackup, ...existingBackups];
      
      // Ограничиваем количество копий до 10
      const limitedBackups = updatedBackups.slice(0, 10);
      
      localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(limitedBackups));
    } catch (error) {
      console.error('Ошибка при создании резервной копии:', error);
      throw new Error('Не удалось создать резервную копию');
    }
  },
  
  restoreBackup: async (backupId: string): Promise<void> => {
    try {
      // Получаем все резервные копии
      const backups = await backupAPI.getBackups();
      
      // Находим нужную копию
      const backup = backups.find(b => b.id === backupId);
      if (!backup) {
        throw new Error('Резервная копия не найдена');
      }
      
      // Восстанавливаем данные
      const dataToRestore = backup.data;
      
      // Обновляем кэш в памяти
      (dataAPI as any)._cachedData = dataToRestore;
      
      // Сохраняем в localStorage
      localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(dataToRestore));
    } catch (error) {
      console.error('Ошибка при восстановлении из резервной копии:', error);
      throw new Error('Не удалось восстановить из резервной копии');
    }
  },
  
  deleteBackup: async (backupId: string): Promise<void> => {
    try {
      // Получаем все резервные копии
      const backups = await backupAPI.getBackups();
      
      // Удаляем нужную копию
      const updatedBackups = backups.filter(b => b.id !== backupId);
      
      // Сохраняем обновленный список
      localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(updatedBackups));
    } catch (error) {
      console.error('Ошибка при удалении резервной копии:', error);
      throw new Error('Не удалось удалить резервную копию');
    }
  }
};

// В будущем здесь будет настоящий клиент Axios для работы с бэкендом
const createApiClient = () => {
  const client = axios.create({
    // baseURL будет установлен позже, при подключении к реальному бэкенду
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Заготовка для будущего интерцептора токена авторизации
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  return client;
};

// Создаем экземпляр для будущего использования
const api = createApiClient();

export default api; 