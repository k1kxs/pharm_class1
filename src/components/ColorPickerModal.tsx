import React from 'react';
import Modal from './ui/Modal';
import { Palette } from 'lucide-react';

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Выбор цвета цикла">
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Palette size={28} className="text-blue-600" />
          </div>
        </div>
        
        <p className="text-center text-gray-700 mb-4">
          Выберите цвет для цикла
        </p>
        
        <div className="grid grid-cols-3 gap-3">
          {gradientOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onColorSelect(option.value);
                onClose();
              }}
              className={`
                h-16 rounded-lg overflow-hidden bg-gradient-to-r ${option.value}
                flex items-end justify-center p-1 hover:opacity-90
                ${currentGradient === option.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
              `}
            >
              <span className="text-xs font-medium bg-white bg-opacity-80 rounded px-2 py-1 text-gray-800">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default ColorPickerModal; 