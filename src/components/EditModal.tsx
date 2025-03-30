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
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ],
    clipboard: {
      // Позволяем сохранять форматирование при вставке
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
      if (type === 'category' || (type === 'subgroup' && initialData.id) || (type === 'group' && initialData.id)) {
        console.log('Загружаем препараты для редактирования:', initialData.preparations);
        // Убеждаемся, что данные препаратов существуют перед установкой
        setPreparations(initialData.preparations || '');
      }
      
      if ((type === 'cycle' || type === 'group' || type === 'table') && initialData.gradient) {
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
    
    // Проверка и очистка HTML-контента перед сохранением
    // Но сохраняем форматирование и структуру списков
    const sanitizedPreparations = preparations ? preparations.trim() : '';
    
    // Проверка на наличие тега ol в содержимом
    console.log('Содержит ли numlist:', sanitizedPreparations.includes('<ol>'));
    
    const data: any = {
      // Для редактирования препаратов категории, группы и подгруппы сохраняем текущее название
      name: ((type === 'group' || type === 'subgroup' || (type === 'category' && initialData?.id)) && initialData?.id) ? initialData.name : name
    };
    
    // Добавляем препараты только для категорий, подгрупп и существующих групп
    if (type === 'category' || (type === 'subgroup' && initialData?.id) || (type === 'group' && initialData?.id)) {
      data.preparations = sanitizedPreparations;
    }
    
    if (type === 'cycle') {
      data.gradient = gradient;
      data.groups = [];
    } else if (type === 'group') {
      // Для редактирования препаратов группы сохраняем текущий градиент
      data.gradient = (initialData?.id) ? initialData.gradient : gradient;
      data.subgroups = [];
    } else if (type === 'subgroup') {
      data.categories = [];
    } else if (type === 'table') {
      data.gradient = gradient;
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
    // Проверяем, является ли контент пустым редактором
    const isEmptyEditor = content === '<p><br></p>';
    
    // Сохраняем HTML без изменений, чтобы сохранить форматирование и нумерацию
    setPreparations(isEmptyEditor ? '' : content);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Название показываем не для редактирования препаратов существующей группы, подгруппы или категории */}
        {!((type === 'group' || type === 'subgroup' || (type === 'category' && initialData?.id)) && initialData?.id) && (
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
              required={!((type === 'group' || type === 'subgroup' || (type === 'category' && initialData?.id)) && initialData?.id)}
            />
          </div>
        )}
        
        {/* Выбор цвета показываем не для редактирования препаратов существующей группы */}
        {(type === 'cycle' || (type === 'group' && !initialData?.id) || type === 'table') && (
          <div className="space-y-2">
            <label htmlFor="gradient" className="text-sm font-medium text-gray-700 flex items-center">
              <Palette size={16} className="mr-1" /> 
              Цвет {
                type === 'cycle' ? 'цикла' : 
                type === 'table' ? 'шапки таблицы' : 
                'группы'
              }
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
        
        {(type === 'category' || (type === 'subgroup' && initialData?.id) || (type === 'group' && initialData?.id)) && (
          <div className="space-y-2">
            <label htmlFor="preparations" className="text-sm font-medium text-gray-700">
              Препараты
            </label>
            <div className="quill-container border rounded-md overflow-hidden shadow-sm">
              <style dangerouslySetInnerHTML={{ __html: `
                /* Базовые стили для редактора */
                .ql-editor {
                  padding: 1rem !important;
                }
                /* Одинаковый отступ для всех элементов */
                .ql-editor p,
                .ql-editor ol, 
                .ql-editor ul {
                  padding-left: 0 !important;
                  margin-left: 0 !important;
                  margin-bottom: 0.5rem !important;
                  text-indent: 0 !important;
                }
                /* Единые стили для всех элементов списка */
                .ql-editor ol li, 
                .ql-editor ul li {
                  position: relative !important;
                  padding-left: 1.2rem !important;
                  margin-left: 0 !important;
                  counter-increment: list-item !important;
                  text-indent: 0 !important;
                }
                /* Полностью отключаем встроенные маркеры Quill */
                .ql-editor li:before {
                  margin: 0 !important;
                  width: 0 !important;
                  display: none !important;
                  content: none !important;
                }
                /* Унифицированные стили для маркеров списков */
                .ql-editor ul > li:before,
                .ql-editor ol > li:before {
                  display: block !important;
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 1.2rem !important;
                  text-align: left !important;
                }
                /* Маркер для ul */
                .ql-editor ul > li:before {
                  content: "•" !important;
                  color: #3b82f6 !important;
                }
                /* Маркер для ol */
                .ql-editor ol {
                  counter-reset: list-item !important;
                }
                .ql-editor ol > li:before {
                  content: counter(list-item) "." !important;
                  font-weight: 500 !important;
                }
                /* Убираем отступы для вложенных списков */
                .ql-editor .ql-indent-1,
                .ql-editor .ql-indent-2,
                .ql-editor .ql-indent-3 {
                  padding-left: 0 !important;
                  margin-left: 0 !important;
                }
                /* Принудительно убираем любые вставленные стили */
                .ql-editor * {
                  margin-left: 0 !important;
                }
                /* Отключаем дополнительные отступы для других стилей */
                .ql-editor [class*="ql-indent"] {
                  padding-left: 0 !important;
                  margin-left: 0 !important;
                }
              `}} />
              <ReactQuill
                value={preparations}
                onChange={handlePreparationsChange}
                modules={modules}
                formats={formats}
                placeholder="Введите список препаратов..."
                theme="snow"
                className="custom-quill-editor"
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