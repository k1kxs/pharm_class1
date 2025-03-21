import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import { Lock, X, Eye, EyeOff, LogIn } from 'lucide-react';
import { PasswordModalProps } from './types';

const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onPasswordSubmit,
  error
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Очищаем ввод при закрытии/открытии
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setShowPassword(false);
    }
  }, [isOpen]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onPasswordSubmit(password);
    } catch (error) {
      console.error('Ошибка при отправке пароля:', error);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Вход в режим редактирования">
      <div className="p-2">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Lock size={26} />
          </div>
        </div>
        
        <p className="text-gray-600 text-center mb-4 max-w-xs mx-auto">
          Для редактирования классификации лекарственных средств введите пароль администратора
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 shadow-sm ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Введите пароль"
                autoFocus
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm mt-2 flex items-center">
                <X size={14} className="mr-1 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm flex items-center"
            >
              <LogIn size={16} className="mr-1.5" />
              Войти
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PasswordModal; 