import React from 'react';
import Modal from './ui/Modal';
import { X } from 'lucide-react';

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
  title = "Выбор цвета"
}) => {
  const gradientOptions = [
    { value: 'from-blue-500 via-indigo-500 to-violet-600', label: 'Синий' },
    { value: 'from-emerald-500 via-teal-500 to-cyan-600', label: 'Изумрудный' },
    { value: 'from-amber-500 via-orange-500 to-yellow-500', label: 'Оранжевый' },
    { value: 'from-red-500 via-rose-500 to-pink-500', label: 'Красный' },
    { value: 'from-purple-500 via-violet-500 to-indigo-600', label: 'Фиолетовый' },
    { value: 'from-sky-500 via-blue-500 to-indigo-500', label: 'Небесный' },
    { value: 'from-green-500 via-emerald-500 to-teal-500', label: 'Зеленый' },
    { value: 'from-yellow-500 via-amber-500 to-orange-500', label: 'Желтый' },
    { value: 'from-pink-500 via-rose-500 to-red-500', label: 'Розовый' },
    { value: 'from-gray-500 via-gray-600 to-gray-700', label: 'Серый' },
    { value: 'from-stone-500 via-stone-600 to-stone-700', label: 'Коричневый' },
    { value: 'from-lime-500 via-lime-600 to-green-600', label: 'Лаймовый' },
    { value: 'from-fuchsia-500 via-purple-500 to-pink-500', label: 'Фуксия' },
    { value: 'from-rose-500 via-red-500 to-red-600', label: 'Коралловый' },
    { value: 'from-teal-500 via-cyan-500 to-sky-500', label: 'Бирюзовый' }
  ];

  const handleSelectColor = (value: string) => {
    onColorSelect(value);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
        {gradientOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelectColor(option.value)}
            className={`
              h-16 w-full rounded-md overflow-hidden bg-gradient-to-r ${option.value}
              ${currentGradient === option.value ? 'ring-2 ring-white' : ''}
            `}
            title={option.label}
          />
        ))}
      </div>
      
      <div className="flex justify-end mt-4">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X size={14} className="inline mr-1" /> Закрыть
        </button>
      </div>
    </Modal>
  );
};

export default ColorPickerModal; 