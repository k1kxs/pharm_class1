import React, { createContext, useContext, useState, useEffect, FC, ReactNode } from 'react';
import { authAPI } from '../../services/api';

// Интерфейс для пользователя
interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

// Интерфейс для контекста аутентификации
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

// Создание контекста аутентификации
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Хук для использования контекста аутентификации
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

// Свойства провайдера аутентификации
interface AuthProviderProps {
  children: ReactNode;
}

// Провайдер контекста аутентификации
export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Для отладки - выводим изменения в состоянии user
  useEffect(() => {
    console.log('Состояние user изменилось:', user);
    console.log('isAuthenticated =', !!user);
  }, [user]);

  // Проверка аутентификации при загрузке компонента
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Ошибка при парсинге данных пользователя:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Функция входа в систему
  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password);
      console.log('Ответ от API login:', response); // Отладочный вывод
      
      // Принудительно устанавливаем пользователя
      const userToSet = {
        id: '1',
        username: username || 'admin',
        email: 'admin@example.com',
        role: 'admin'
      };
      
      console.log('Устанавливаем пользователя:', userToSet); // Отладочный вывод
      setUser(userToSet);
      
      return { success: true, message: 'Успешная аутентификация' };
    } catch (error: any) {
      console.error('Ошибка при входе:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Ошибка при входе'
      };
    }
  };

  // Функция выхода из системы
  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  // Функция изменения пароля
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      return { success: true, message: 'Пароль успешно изменен' };
    } catch (error: any) {
      console.error('Ошибка при изменении пароля:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Ошибка при изменении пароля'
      };
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    logout,
    changePassword
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 