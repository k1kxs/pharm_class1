import { SHA256 } from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticationResult, UserSession, LoginAttempts } from '../types';

// Константы безопасности
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 минут в миллисекундах
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

// Хешированный пароль (вместо хранения в исходном коде)
// Этот хеш соответствует 'admin123'
const ADMIN_PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

// Глобальные переменные для хранения состояния (в реальном приложении использовался бы localStorage или SessionStorage)
let loginAttempts: LoginAttempts = {
  count: 0,
  lastAttempt: 0,
  lockedUntil: null
};

let currentSession: UserSession | null = null;

/**
 * Хеширует пароль с использованием SHA-256
 */
export const hashPassword = (password: string): string => {
  return SHA256(password).toString();
};

/**
 * Сравнивает введенный пароль с хешированным паролем
 */
export const comparePassword = (password: string): boolean => {
  const hashedPassword = hashPassword(password);
  return hashedPassword === ADMIN_PASSWORD_HASH;
};

/**
 * Генерирует JWT токен для аутентификации
 */
export const generateToken = (): string => {
  return uuidv4();
};

/**
 * Проверяет, заблокирован ли пользователь из-за слишком большого количества попыток входа
 */
export const isUserLocked = (): boolean => {
  if (!loginAttempts.lockedUntil) return false;
  
  // Если блокировка истекла, сбросить
  if (Date.now() > loginAttempts.lockedUntil) {
    loginAttempts.lockedUntil = null;
    loginAttempts.count = 0;
    return false;
  }
  
  return true;
};

/**
 * Возвращает оставшееся время блокировки в минутах
 */
export const getLockoutTimeRemaining = (): number => {
  if (!loginAttempts.lockedUntil) return 0;
  
  const remainingMs = Math.max(0, loginAttempts.lockedUntil - Date.now());
  return Math.ceil(remainingMs / 60000); // Конвертация в минуты
};

/**
 * Пытается аутентифицировать пользователя с указанным паролем
 */
export const authenticateUser = (password: string): AuthenticationResult => {
  // Проверка блокировки
  if (isUserLocked()) {
    return {
      success: false,
      message: `Аккаунт временно заблокирован. Попробуйте через ${getLockoutTimeRemaining()} мин.`
    };
  }
  
  // Регистрируем попытку
  loginAttempts.lastAttempt = Date.now();
  loginAttempts.count++;
  
  // Проверка пароля
  if (comparePassword(password)) {
    // Успешный вход - сбрасываем счетчик и создаем сессию
    loginAttempts.count = 0;
    
    // Создаем новую сессию
    const token = generateToken();
    const expiresAt = Date.now() + TOKEN_EXPIRY;
    
    currentSession = {
      token,
      expiresAt
    };
    
    return {
      success: true,
      message: 'Успешная аутентификация',
      token,
      expiresAt
    };
  } else {
    // Неудачная попытка входа
    if (loginAttempts.count >= MAX_LOGIN_ATTEMPTS) {
      // Блокируем аккаунт
      loginAttempts.lockedUntil = Date.now() + LOCKOUT_TIME;
      
      return {
        success: false,
        message: `Слишком много неудачных попыток. Аккаунт заблокирован на ${LOCKOUT_TIME / 60000} минут.`
      };
    }
    
    // Сообщаем о неверном пароле и оставшихся попытках
    return {
      success: false,
      message: `Неверный пароль. Осталось попыток: ${MAX_LOGIN_ATTEMPTS - loginAttempts.count}`
    };
  }
};

/**
 * Проверяет валидность текущей сессии
 */
export const isSessionValid = (): boolean => {
  if (!currentSession) return false;
  
  // Проверяем, не истек ли токен
  return Date.now() < currentSession.expiresAt;
};

/**
 * Завершает текущую сессию пользователя
 */
export const logoutUser = (): void => {
  currentSession = null;
}; 