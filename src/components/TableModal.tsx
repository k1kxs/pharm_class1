import React, { useState, useEffect } from 'react';
import { X, Info, Grid, Table as TableIcon, Check, MousePointer } from 'lucide-react';
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
  const [isSizeFixed, setIsSizeFixed] = useState<boolean>(false);
  const maxSize = 10; // Максимальный размер сетки конструктора

  // Сброс состояния при открытии/закрытии модального окна
  useEffect(() => {
    if (isOpen) {
      setHoveredCell(null);
      setSelectedSize({ rows: 0, cols: 0 });
      setIsSizeFixed(false);
      // Устанавливаем дефолтное название таблицы
      setNewTableName(`Таблица ${new Date().toLocaleString('ru')}`);
      // Устанавливаем градиент по умолчанию
      setNewTableGradient('from-blue-500 via-indigo-500 to-violet-600');
    }
  }, [isOpen, setNewTableName, setNewTableGradient]);

  // Обработчик наведения на ячейку
  const handleCellHover = (row: number, col: number) => {
    if (!isSizeFixed) {
      setHoveredCell({ row, col });
    }
  };

  // Обработчик клика по ячейке
  const handleCellClick = (row: number, col: number) => {
    setSelectedSize({ rows: row + 1, cols: col + 1 });
    setNewTableSize(row + 1, col + 1);
    setIsSizeFixed(true);
  };

  // Обработчик для сброса фиксации размера
  const handleResetSize = () => {
    setIsSizeFixed(false);
    setHoveredCell(null);
  };

  // Обработчик создания таблицы
  const handleCreateTable = () => {
    if (selectedSize.rows > 0 && selectedSize.cols > 0) {
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
        const isSelected = row < selectedSize.rows && col < selectedSize.cols;
        const isHighlighted = isSelected || 
          (!isSizeFixed && hoveredCell && row <= hoveredCell.row && col <= hoveredCell.col);
        
        cells.push(
          <div 
            key={`${row}-${col}`}
            className={`w-6 h-6 m-0.5 rounded-sm cursor-pointer transition-all duration-200 shadow-sm 
              ${isHighlighted 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-700 border border-blue-300 transform scale-105' 
                : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow'}`}
            onMouseEnter={() => handleCellHover(row, col)}
            onClick={() => handleCellClick(row, col)}
          />
        );
      }
    }
    return cells;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all duration-300 scale-100">
        {/* Заголовок */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <TableIcon size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Конструктор таблицы</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Содержимое */}
        <div className="p-6">
          {/* Конструктор таблицы */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Grid size={18} className="text-blue-600 mr-2" />
                <h3 className="text-md font-semibold text-gray-800">Размер таблицы</h3>
              </div>
              
              {isSizeFixed && (
                <button 
                  className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
                  onClick={handleResetSize}
                >
                  <MousePointer size={12} className="mr-1" />
                  Изменить выбор
                </button>
              )}
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="flex-1">
                <div className="grid grid-cols-10 mb-4 bg-gray-50 p-3 rounded-lg">
                  {renderGridConstructor()}
                </div>
                <div className="text-sm text-gray-600 flex items-center bg-blue-50 p-2 px-3 rounded-md">
                  <Info size={14} className="text-blue-600 mr-2 flex-shrink-0" />
                  <span>{isSizeFixed ? 'Размер выбран. Нажмите "Изменить выбор" для изменения' : 'Кликните на ячейку, чтобы выбрать размер таблицы'}</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 shadow-sm min-w-[180px]">
                <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  Текущий размер:
                  {isSizeFixed && <Check size={14} className="ml-2 text-green-500" />}
                </div>
                <div className="text-2xl font-bold text-blue-800 mb-1">
                  {selectedSize.rows} <span className="text-lg text-blue-400">×</span> {selectedSize.cols}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedSize.rows > 0 ? (
                    <>
                      {selectedSize.rows} {selectedSize.rows === 1 ? 'строка' : selectedSize.rows < 5 ? 'строки' : 'строк'},
                      <br />
                      {selectedSize.cols} {selectedSize.cols === 1 ? 'столбец' : selectedSize.cols < 5 ? 'столбца' : 'столбцов'}
                    </>
                  ) : (
                    <span className="text-orange-500">Выберите размер</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Отмена
          </button>
          <button
            onClick={handleCreateTable}
            className={`px-5 py-2 rounded-lg text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
              selectedSize.rows > 0 && selectedSize.cols > 0
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-lg hover:from-blue-700 hover:to-indigo-800'
                : 'bg-blue-300 cursor-not-allowed'
            }`}
            disabled={selectedSize.rows === 0 || selectedSize.cols === 0}
          >
            Создать таблицу
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableModal; 