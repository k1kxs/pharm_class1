import React, { createContext, useContext, useState, useEffect, FC, ReactNode } from "react";
import { authAPI } from "../../services/api";

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
    throw new Error("useAuth должен использоваться внутри AuthProvider");
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

  // Проверка аутентификации при загрузке компонента
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Проверяем наличие сохраненного пользователя
        const storedUser = localStorage.getItem("user");
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Ошибка при проверке аутентификации:", error);
        // При ошибке очищаем данные аутентификации
        authAPI.logout();
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Функция входа в систему
  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password);
      
      // Устанавливаем пользователя из ответа
      setUser(response.user);
      
      return { success: true, message: response.message };
    } catch (error: any) {
      console.error("Ошибка при входе:", error);
      return {
        success: false,
        message: error.message || "Ошибка при входе"
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
      const result = await authAPI.changePassword(currentPassword, newPassword);
      return { success: true, message: result.message };
    } catch (error: any) {
      console.error("Ошибка при изменении пароля:", error);
      return {
        success: false,
        message: error.message || "Ошибка при изменении пароля"
      };
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
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