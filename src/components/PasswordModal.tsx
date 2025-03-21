import React, { useState } from 'react';
import Modal from './ui/Modal';
import { Key, ShieldAlert } from 'lucide-react';
import { useAuth } from './context/AuthProvider';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordSubmit: (success: boolean) => void;
  error: string | null;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onPasswordSubmit,
  error
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setLocalError('Имя пользователя и пароль обязательны');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await login(username, password);
      
      if (result.success) {
        setUsername('');
        setPassword('');
        setLocalError(null);
        onPasswordSubmit(true);
      } else {
        setLocalError(result.message);
        onPasswordSubmit(false);
      }
    } catch (error) {
      setLocalError('Ошибка при входе. Попробуйте позже.');
      onPasswordSubmit(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Вход в режим редактирования">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Key size={28} className="text-blue-600" />
          </div>
        </div>
        
        <p className="text-center text-gray-700 mb-4">
          Для редактирования классификации необходимо войти в систему
        </p>
        
        <div className="space-y-3">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Имя пользователя
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              required
              autoComplete="username"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              required
              autoComplete="current-password"
              aria-invalid={error || localError ? "true" : "false"}
            />
          </div>
        </div>
        
        {(error || localError) && (
          <div className="text-red-600 text-sm p-2 bg-red-50 rounded" role="alert">
            {error || localError}
          </div>
        )}
        
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Вход...' : 'Войти'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PasswordModal; 