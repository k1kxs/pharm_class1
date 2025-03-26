import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2, Plus, Minus, Settings } from 'lucide-react';
import { useDrugClassification } from './context/DrugClassificationContext';
import { Table } from './types';

interface TableComponentProps {
  table: Table;
  isEditorMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onColorChange: () => void;
}

const TableComponent: React.FC<TableComponentProps> = ({
  table,
  isEditorMode,
  onEdit,
  onDelete,
  onColorChange
}) => {
  const { 
    updateTableCell,
    addTableRow,
    addTableColumn,
    removeTableRow,
    removeTableColumn
  } = useDrugClassification();

  const [activeCell, setActiveCell] = useState<{ rowIndex: number; cellIndex: number } | null>(null);
  const [cellContent, setCellContent] = useState<string>('');
  const [showColumnControls, setShowColumnControls] = useState<number | null>(null);
  const [showRowControls, setShowRowControls] = useState<number | null>(null);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState<boolean>(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const cellInputRef = useRef<HTMLTextAreaElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Фокус на активной ячейке
  useEffect(() => {
    if (activeCell && cellInputRef.current) {
      cellInputRef.current.focus();
    }
  }, [activeCell]);

  // Закрытие контекстного меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setIsContextMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Обработчик клика по ячейке
  const handleCellClick = (rowIndex: number, cellIndex: number) => {
    const content = table.rows[rowIndex].cells[cellIndex].content;
    setActiveCell({ rowIndex, cellIndex });
    setCellContent(content);
  };

  // Обработчик изменения содержимого ячейки
  const handleCellChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCellContent(e.target.value);
  };

  // Обработчик сохранения ячейки
  const handleCellBlur = () => {
    if (activeCell) {
      updateTableCell(table.id, activeCell.rowIndex, activeCell.cellIndex, cellContent);
      setActiveCell(null);
    }
  };

  // Обработчик нажатия Enter в ячейке
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCellBlur();
    }
  };

  // Обработчик контекстного меню таблицы
  const handleContextMenu = (e: React.MouseEvent) => {
    if (isEditorMode) {
      e.preventDefault();
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setIsContextMenuOpen(true);
    }
  };

  // Получение размера таблицы из количества строк и ячеек
  const tableSize = table.rows.length > 0 
    ? `${table.rows.length} x ${table.columns}` 
    : '0 x 0';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      {/* Заголовок таблицы */}
      <div 
        className={`py-3 px-4 flex justify-between items-center bg-gradient-to-r ${table.gradient || 'from-blue-500 via-indigo-500 to-violet-600'}`}
      >
        <h3 className="text-lg font-semibold text-white">{table.name}</h3>
        {isEditorMode && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onColorChange}
              className="p-1.5 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all duration-200"
              title="Изменить цвет"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all duration-200"
              title="Редактировать таблицу"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all duration-200"
              title="Удалить таблицу"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Размер таблицы (для режима редактирования) */}
      {isEditorMode && (
        <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600 border-b">
          Размер: {tableSize}
        </div>
      )}

      {/* Содержимое таблицы */}
      <div className="p-4" onContextMenu={handleContextMenu}>
        <div className="relative overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr 
                  key={row.id}
                  className="border-b border-gray-200 last:border-b-0 group"
                  onMouseEnter={() => isEditorMode && setShowRowControls(rowIndex)}
                  onMouseLeave={() => setShowRowControls(null)}
                >
                  {row.cells.map((cell, cellIndex) => {
                    const isActiveCell = activeCell?.rowIndex === rowIndex && activeCell?.cellIndex === cellIndex;
                    const isFirstRow = rowIndex === 0;
                    
                    return (
                      <td 
                        key={cell.id}
                        className={`relative border border-gray-200 p-0 ${
                          isFirstRow ? 'bg-gray-50 font-medium' : ''
                        } group ${isActiveCell ? 'p-0' : 'p-2'}`}
                        onMouseEnter={() => isEditorMode && setShowColumnControls(cellIndex)}
                        onMouseLeave={() => setShowColumnControls(null)}
                        onClick={() => isEditorMode && handleCellClick(rowIndex, cellIndex)}
                      >
                        {isActiveCell ? (
                          <textarea
                            ref={cellInputRef}
                            value={cellContent}
                            onChange={handleCellChange}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            className="w-full h-full min-h-[40px] p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 border-0"
                          />
                        ) : (
                          <div className="min-h-[40px] p-2">
                            {cell.content}
                          </div>
                        )}
                        
                        {/* Кнопки управления колонками (показываются только при наведении) */}
                        {isEditorMode && isFirstRow && showColumnControls === cellIndex && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addTableColumn(table.id);
                              }}
                              className="p-1 bg-green-500 text-white rounded-full shadow-sm"
                              title="Добавить столбец"
                            >
                              <Plus size={12} />
                            </button>
                            {table.columns > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeTableColumn(table.id, cellIndex);
                                }}
                                className="p-1 bg-red-500 text-white rounded-full shadow-sm"
                                title="Удалить столбец"
                              >
                                <Minus size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  
                  {/* Кнопки управления строками (показываются только при наведении) */}
                  {isEditorMode && showRowControls === rowIndex && (
                    <td className="w-0 p-0 border-0">
                      <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addTableRow(table.id);
                          }}
                          className="p-1 bg-green-500 text-white rounded-full shadow-sm"
                          title="Добавить строку"
                        >
                          <Plus size={12} />
                        </button>
                        {table.rows.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTableRow(table.id, rowIndex);
                            }}
                            className="p-1 bg-red-500 text-white rounded-full shadow-sm"
                            title="Удалить строку"
                          >
                            <Minus size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Контекстное меню */}
      {isContextMenuOpen && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white rounded-md shadow-lg z-50 py-1 min-w-[180px]"
          style={{ 
            top: contextMenuPosition.y, 
            left: contextMenuPosition.x,
            maxWidth: '250px'
          }}
        >
          <button 
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => {
              setIsContextMenuOpen(false);
              onEdit();
            }}
          >
            <Edit2 size={14} className="mr-2" />
            Редактировать название
          </button>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => {
              setIsContextMenuOpen(false);
              onColorChange();
            }}
          >
            <Settings size={14} className="mr-2" />
            Изменить цвет шапки
          </button>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => {
              setIsContextMenuOpen(false);
              addTableRow(table.id);
            }}
          >
            <Plus size={14} className="mr-2" />
            Добавить строку
          </button>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => {
              setIsContextMenuOpen(false);
              addTableColumn(table.id);
            }}
          >
            <Plus size={14} className="mr-2" />
            Добавить столбец
          </button>
          <div className="border-t border-gray-200 my-1"></div>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
            onClick={() => {
              setIsContextMenuOpen(false);
              onDelete();
            }}
          >
            <Trash2 size={14} className="mr-2" />
            Удалить таблицу
          </button>
        </div>
      )}
    </div>
  );
};

export default TableComponent; 