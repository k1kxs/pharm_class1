import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import { EditModalProps } from './types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { X, Save, Palette } from 'lucide-react';

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

  // Конфигурация Quill редактора
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link']
    ],
    clipboard: {
      // Разрешаем вставку всего HTML
      matchVisual: false
    }
  };

  const formats = [
    'bold', 'italic', 'underline',
    'list', 'bullet', 'indent',
    'link'
  ];

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
    console.log('EditModal initialData:', initialData);
    
    if (initialData) {
      setName(initialData.name || '');
      
      // Проверяем наличие препаратов для редактирования
      if (type === 'group' || type === 'category') {
        console.log('Загружаем препараты для редактирования:', initialData.preparations);
        setPreparations(initialData.preparations || '');
      }
      
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
    
    // Если есть начальные данные, сохраняем ID для обновления
    if (initialData && initialData.id) {
      data.id = initialData.id;
    }
    
    console.log('Сохраняем данные:', data);
    onSave(data);
    onClose();
  };

  // При изменении текста препаратов
  const handlePreparationsChange = (content: string) => {
    console.log('Текст препаратов изменен:', content);
    setPreparations(content);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Название
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 shadow-sm"
            placeholder="Введите название..."
            required
          />
        </div>
        
        {type === 'cycle' && (
          <div className="space-y-2">
            <label htmlFor="gradient" className="block text-sm font-medium text-gray-700 flex items-center">
              <Palette size={16} className="mr-1" /> Цвет цикла
            </label>
            <select
              id="gradient"
              value={gradient}
              onChange={(e) => setGradient(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
            >
              {gradientOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className={`w-full h-8 mt-1 rounded-md bg-gradient-to-r ${gradient} shadow-sm`} />
          </div>
        )}
        
        {(type === 'group' || type === 'category') && (
          <div className="space-y-2">
            <label htmlFor="preparations" className="block text-sm font-medium text-gray-700">
              Препараты
            </label>
            <div className="quill-container border rounded-md overflow-hidden shadow-sm">
              <ReactQuill
                value={preparations}
                onChange={handlePreparationsChange}
                modules={modules}
                formats={formats}
                placeholder="Введите список препаратов..."
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Используйте форматирование для создания структурированного списка препаратов
            </p>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 shadow-sm flex items-center"
          >
            <X size={16} className="mr-1" /> Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm flex items-center"
          >
            <Save size={16} className="mr-1" /> Сохранить
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditModal; 