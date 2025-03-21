import React from 'react';
import Modal from './ui/Modal';
import { Palette, Check, X } from 'lucide-react';

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (gradient: string) => void;
  currentGradient?: string;
}

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isOpen,
  onClose,
  onColorSelect,
  currentGradient
}) => {
  const gradientOptions = [
    { value: 'from-blue-500 via-indigo-500 to-violet-600', label: 'Синий' },
    { value: 'from-emerald-500 via-teal-500 to-cyan-600', label: 'Изумрудный' },
    { value: 'from-amber-500 via-orange-500 to-yellow-500', label: 'Оранжевый' },
    { value: 'from-red-500 via-rose-500 to-pink-500', label: 'Красный' },
    { value: 'from-purple-600 via-violet-600 to-indigo-600', label: 'Фиолетовый' },
    { value: 'from-sky-500 via-blue-500 to-indigo-500', label: 'Небесный' },
    { value: 'from-green-500 via-emerald-500 to-teal-500', label: 'Зеленый' },
    { value: 'from-yellow-500 via-amber-500 to-orange-500', label: 'Желтый' },
    { value: 'from-pink-500 via-rose-500 to-red-500', label: 'Розовый' }
  ];

  const handleSelectColor = (value: string) => {
    onColorSelect(value);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Выбор цвета цикла">
      <div className="space-y-5">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full">
            <Palette size={30} />
          </div>
        </div>
        
        <p className="text-center text-gray-700 mb-5 max-w-xs mx-auto">
          Выберите цветовую схему для оформления цикла
        </p>
        
        <div className="grid grid-cols-3 gap-4">
          {gradientOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelectColor(option.value)}
              className={`
                relative h-20 rounded-lg overflow-hidden bg-gradient-to-r ${option.value}
                flex items-end justify-center p-2 hover:shadow-md transition-all duration-200
                ${currentGradient === option.value ? 'ring-4 ring-offset-2 ring-indigo-300' : 'ring-1 ring-gray-200'}
              `}
              title={option.label}
            >
              {currentGradient === option.value && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow-sm">
                  <Check size={14} className="text-indigo-600" />
                </div>
              )}
              <span className="text-xs font-medium bg-white/90 rounded-md px-2 py-1.5 text-gray-800 shadow-sm">
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