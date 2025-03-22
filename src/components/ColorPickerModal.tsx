import React from 'react';
import Modal from './ui/Modal';
import { Palette, Check, X } from 'lucide-react';

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (gradient: string) => void;
  currentGradient?: string;
  title?: string;
}

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isOpen,
  onClose,
  onColorSelect,
  currentGradient,
  title = "Выбор цвета цикла"
}) => {
  const gradientOptions = [
    { value: '', label: 'Без цвета' },
    { value: 'from-blue-300 via-indigo-300 to-violet-400', label: 'Синий' },
    { value: 'from-emerald-300 via-teal-300 to-cyan-400', label: 'Изумрудный' },
    { value: 'from-amber-300 via-orange-300 to-yellow-300', label: 'Оранжевый' },
    { value: 'from-red-300 via-rose-300 to-pink-300', label: 'Красный' },
    { value: 'from-purple-300 via-violet-300 to-indigo-400', label: 'Фиолетовый' },
    { value: 'from-sky-300 via-blue-300 to-indigo-300', label: 'Небесный' },
    { value: 'from-green-300 via-emerald-300 to-teal-300', label: 'Зеленый' },
    { value: 'from-yellow-300 via-amber-300 to-orange-300', label: 'Желтый' },
    { value: 'from-pink-300 via-rose-300 to-red-300', label: 'Розовый' },
    { value: 'from-gray-300 via-gray-400 to-gray-500', label: 'Серый' },
    { value: 'from-stone-300 via-stone-400 to-stone-500', label: 'Коричневый' },
    { value: 'from-lime-300 via-lime-400 to-green-400', label: 'Лаймовый' },
    { value: 'from-fuchsia-300 via-purple-300 to-pink-300', label: 'Фуксия' },
    { value: 'from-rose-300 via-red-300 to-red-400', label: 'Коралловый' },
    { value: 'from-teal-300 via-cyan-300 to-sky-300', label: 'Бирюзовый' }
  ];

  const handleSelectColor = (value: string) => {
    onColorSelect(value);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-5">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full">
            <Palette size={30} />
          </div>
        </div>
        
        <p className="text-center text-gray-700 mb-5 max-w-xs mx-auto">
          Выберите цветовую схему или "Без цвета" для стандартного оформления
        </p>
        
        <div className="grid grid-cols-4 gap-3">
          {gradientOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelectColor(option.value)}
              className={`
                relative h-20 rounded-lg overflow-hidden ${option.value ? `bg-gradient-to-r ${option.value}` : 'bg-white border border-dashed border-gray-300'}
                flex flex-col items-center justify-center p-2 hover:shadow-md transition-all duration-200
                ${currentGradient === option.value ? 'ring-4 ring-offset-2 ring-indigo-300' : 'ring-1 ring-gray-200'}
              `}
              title={option.label}
            >
              {currentGradient === option.value && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow-sm">
                  <Check size={14} className="text-indigo-600" />
                </div>
              )}
              
              {option.value && (
                <span className="text-xs font-medium text-gray-800 mb-1">Пример</span>
              )}
              
              <span className={`text-xs font-medium ${option.value ? 'bg-white/80' : 'bg-gray-100'} rounded-md px-2 py-1 text-gray-800 shadow-sm`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
        
        <div className="flex justify-end border-t pt-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 shadow-sm flex items-center"
          >
            <X size={16} className="mr-1.5" />
            Закрыть
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ColorPickerModal; 