import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { useDrugClassification } from './context/DrugClassificationContext';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TableModal: React.FC<TableModalProps> = ({ isOpen, onClose }) => {
  const { 
    newTableName, 
    setNewTableName,
    newTableGradient, 
    setNewTableGradient,
    newTableRows,
    newTableColumns,
    setNewTableSize,
    createTable
  } = useDrugClassification();

  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedSize, setSelectedSize] = useState<{ rows: number; cols: number }>({ rows: 0, cols: 0 });
  const maxSize = 10; // Максимальный размер сетки конструктора

  // Сброс состояния при открытии/закрытии модального окна
  useEffect(() => {
    if (isOpen) {
      setHoveredCell(null);
      setSelectedSize({ rows: 0, cols: 0 });
    }
  }, [isOpen]);

  // Обработчик наведения на ячейку
  const handleCellHover = (row: number, col: number) => {
    setHoveredCell({ row, col });
  };

  // Обработчик клика по ячейке
  const handleCellClick = (row: number, col: number) => {
    setSelectedSize({ rows: row + 1, cols: col + 1 });
    setNewTableSize(row + 1, col + 1);
  };

  // Обработчик создания таблицы
  const handleCreateTable = () => {
    if (newTableName.trim() && selectedSize.rows > 0 && selectedSize.cols > 0) {
      createTable();
      onClose();
    }
  };

  // Генерация сетки конструктора
  const renderGridConstructor = () => {
    const cells = [];
    for (let row = 0; row < maxSize; row++) {
      for (let col = 0; col < maxSize; col++) {
        // Определяем, подсвечена ли ячейка
        const isHighlighted = 
          (hoveredCell && row <= hoveredCell.row && col <= hoveredCell.col) || 
          (row < selectedSize.rows && col < selectedSize.cols);
        
        cells.push(
          <div 
            key={`${row}-${col}`}
            className={`w-6 h-6 border border-gray-300 m-0.5 cursor-pointer transition-colors ${
              isHighlighted ? 'bg-blue-500' : 'bg-white'
            }`}
            onMouseEnter={() => handleCellHover(row, col)}
            onClick={() => handleCellClick(row, col)}
          />
        );
      }
    }
    return cells;
  };

  // Список предустановленных градиентов
  const gradients = [
    'from-blue-500 via-indigo-500 to-violet-600',
    'from-emerald-500 via-teal-500 to-cyan-600',
    'from-amber-500 via-orange-500 to-yellow-500',
    'from-red-500 via-rose-500 to-pink-500',
    'from-purple-600 via-violet-600 to-indigo-600',
    'from-sky-500 via-blue-500 to-indigo-500',
    'from-green-500 via-emerald-500 to-teal-500',
    'from-yellow-500 via-amber-500 to-orange-500',
    'from-pink-500 via-rose-500 to-red-500'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Заголовок */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Создание таблицы</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Содержимое */}
        <div className="p-5">
          {/* Название таблицы */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название таблицы
            </label>
            <input
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите название таблицы"
            />
          </div>

          {/* Выбор цвета шапки */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Цвет шапки таблицы
            </label>
            <div className="grid grid-cols-4 gap-2">
              {gradients.map((gradient, index) => (
                <div
                  key={index}
                  className={`h-10 rounded cursor-pointer border-2 bg-gradient-to-r ${gradient} ${
                    newTableGradient === gradient ? 'border-blue-500' : 'border-transparent'
                  }`}
                  onClick={() => setNewTableGradient(gradient)}
                />
              ))}
            </div>
          </div>

          {/* Конструктор таблицы */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Размер таблицы
            </label>
            <div className="flex items-start gap-8">
              <div>
                <div className="grid grid-cols-10 mb-3">
                  {renderGridConstructor()}
                </div>
                <div className="text-sm text-gray-600 flex items-center">
                  <Info size={14} className="mr-1" />
                  Кликните на ячейку, чтобы выбрать размер таблицы
                </div>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Текущий размер:</div>
                <div className="text-lg font-semibold">
                  {selectedSize.rows} x {selectedSize.cols}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {selectedSize.rows} строк, {selectedSize.cols} столбцов
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Отмена
          </button>
          <button
            onClick={handleCreateTable}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              newTableName.trim() && selectedSize.rows > 0 && selectedSize.cols > 0
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-400 cursor-not-allowed'
            }`}
            disabled={!newTableName.trim() || selectedSize.rows === 0 || selectedSize.cols === 0}
          >
            Создать таблицу
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableModal; 