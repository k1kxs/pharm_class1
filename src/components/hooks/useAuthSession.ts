import { useState, useEffect } from 'react';
import { isSessionValid } from '../utils/authUtils';

interface UseAuthSessionResult {
  isSessionActive: boolean;
  timeRemaining: number;
}

/**
 * Хук для управления сессией аутентификации
 * Проверяет состояние сессии и обновляет информацию каждую минуту
 */
const useAuthSession = (): UseAuthSessionResult => {
  const [isSessionActive, setIsSessionActive] = useState<boolean>(isSessionValid());
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    // Проверяем состояние сессии
    const checkSession = () => {
      const sessionValid = isSessionValid();
      setIsSessionActive(sessionValid);
    };

    // Выполняем проверку при монтировании компонента
    checkSession();

    // Создаем интервал для периодической проверки (каждую минуту)
    const intervalId = setInterval(checkSession, 60000);

    // Очищаем интервал при размонтировании
    return () => clearInterval(intervalId);
  }, []);

  return {
    isSessionActive,
    timeRemaining
  };
};

export default useAuthSession; 