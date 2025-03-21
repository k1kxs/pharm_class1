import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import { EditModalProps } from './types';

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  type,
  title,
  initialData,
  parentId
}) => {
  const [name, setName] = useState('');
  const [preparations, setPreparations] = useState('');
  const [gradient, setGradient] = useState('from-blue-500 via-indigo-500 to-violet-600');

  // Опции градиентов для циклов
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

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPreparations(initialData.preparations || '');
      if (type === 'cycle' && initialData.gradient) {
        setGradient(initialData.gradient);
      }
    } else {
      setName('');
      setPreparations('');
      setGradient('from-blue-500 via-indigo-500 to-violet-600');
    }
  }, [initialData, type, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: any = {
      name,
      preparations: type === 'group' || type === 'category' ? preparations : undefined
    };
    
    if (type === 'cycle') {
      data.gradient = gradient;
      data.groups = [];
    } else if (type === 'group') {
      data.subgroups = [];
    } else if (type === 'subgroup') {
      data.categories = [];
    }
    
    onSave(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Название
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        {type === 'cycle' && (
          <div>
            <label htmlFor="gradient" className="block text-sm font-medium text-gray-700 mb-1">
              Цвет цикла
            </label>
            <select
              id="gradient"
              value={gradient}
              onChange={(e) => setGradient(e.target.value)}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            >
              {gradientOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className={`w-full h-6 mt-2 rounded bg-gradient-to-r ${gradient}`} />
          </div>
        )}
        
        {(type === 'group' || type === 'category') && (
          <div>
            <label htmlFor="preparations" className="block text-sm font-medium text-gray-700 mb-1">
              Препараты
            </label>
            <textarea
              id="preparations"
              value={preparations}
              onChange={(e) => setPreparations(e.target.value)}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Для форматирования используйте теги: &lt;b&gt;жирный&lt;/b&gt;, &lt;i&gt;курсив&lt;/i&gt;
            </p>
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
          >
            Сохранить
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditModal; 