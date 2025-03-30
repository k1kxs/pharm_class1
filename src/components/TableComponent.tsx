import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Trash, Plus, Minus, Settings, GripVertical, Columns, Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useDrugClassification } from './context/DrugClassificationContext';
import { Table } from './types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// Импортируем стили для поддержки HTML-форматирования
import 'tailwindcss/tailwind.css';

interface TableComponentProps {
  table: Table;
  isEditorMode: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onColorChange?: () => void;
  hideHeader?: boolean;
  groupId?: number;
  categoryId?: number; // ID категории для таблиц в категориях
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
}

const TableComponent: React.FC<TableComponentProps> = ({
  table,
  isEditorMode,
  onEdit,
  onDelete,
  onColorChange,
  hideHeader = false,
  groupId,
  categoryId,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}) => {
  const { 
    cycles,
    updateTableCell,
    addTableRow,
    addTableColumn,
    removeTableRow,
    removeTableColumn,
    updateGroupTableCell,
    addTableRowInGroup,
    addTableColumnInGroup,
    removeTableRowInGroup,
    removeTableColumnInGroup,
    updateCategoryTableCell,
    addTableRowInCategory,
    addTableColumnInCategory,
    removeTableRowInCategory,
    removeTableColumnInCategory,
    updateSubgroupTableCell,
    addTableRowInSubgroup,
    addTableColumnInSubgroup,
    removeTableRowInSubgroup,
    removeTableColumnInSubgroup
  } = useDrugClassification();

  const [activeCell, setActiveCell] = useState<{ rowIndex: number; cellIndex: number } | null>(null);
  const [cellContent, setCellContent] = useState<string>('');
  const [showColumnControls, setShowColumnControls] = useState<number | null>(null);
  const [showRowControls, setShowRowControls] = useState<number | null>(null);

  // Состояние для отслеживания перетаскивания
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [showSizeEditor, setShowSizeEditor] = useState(false);

  // Конфигурация Quill редактора
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ],
    clipboard: {
      // Позволяем сохранять форматирование при вставке
      matchVisual: false
    }
  };

  const formats = [
    'bold', 'italic', 'underline',
    'list', 'bullet', 'align'
  ];

  // Обработчик клика по ячейке
  const handleCellClick = (rowIndex: number, cellIndex: number) => {
    const content = table.rows[rowIndex].cells[cellIndex].content;
    setActiveCell({ rowIndex, cellIndex });
    setCellContent(content);
  };

  // Обработчик изменения содержимого ячейки
  const handleCellChange = (content: string) => {
    if (activeCell) {
      // Проверяем, является ли контент пустым редактором
      const isEmptyEditor = content === '<p><br></p>';
      const finalContent = isEmptyEditor ? '' : content;
      
      setCellContent(finalContent);
      
      // Определяем, находится ли ячейка в подгруппе
      const isInSubgroup = groupId && categoryId && !!cycles?.find((c) => 
        c.groups.find((g) => 
          g.id === groupId && g.subgroups.find((s) => s.id === categoryId)
        )
      );
      
      // Немедленно обновляем данные таблицы
      if (isInSubgroup) {
        // Если ячейка находится в таблице подгруппы
        updateSubgroupTableCell(groupId, categoryId, table.id, activeCell.rowIndex, activeCell.cellIndex, finalContent);
      } else if (groupId && categoryId) {
        // Если есть и groupId и categoryId, обновляем ячейку таблицы категории
        updateCategoryTableCell(groupId, categoryId, table.id, activeCell.rowIndex, activeCell.cellIndex, finalContent);
      } else if (groupId) {
        // Если есть только groupId, обновляем ячейку таблицы группы
        updateGroupTableCell(groupId, table.id, activeCell.rowIndex, activeCell.cellIndex, finalContent);
      } else {
        // Иначе обновляем ячейку обычной таблицы
        updateTableCell(table.id, activeCell.rowIndex, activeCell.cellIndex, finalContent);
      }
    }
  };

  // Обработчик закрытия редактора
  const handleCloseEditor = () => {
    setActiveCell(null);
  };

  // Получение размера таблицы из количества строк и ячеек
  const tableSize = table.rows.length > 0 
    ? `${table.rows.length} x ${table.columns}` 
    : '0 x 0';

  // Обертки для обработчиков drag and drop
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if (onDragStart) onDragStart(e);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragOver(true);
    if (onDragOver) onDragOver(e);
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragOver(false);
    if (onDrop) onDrop(e);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    if (onDragEnd) onDragEnd();
  };

  // Обработчик для изменения размеров таблицы
  const handleAddRow = () => {
    // Определяем, находится ли ячейка в подгруппе
    const isInSubgroup = groupId && categoryId && !!cycles?.find((c) => 
      c.groups.find((g) => 
        g.id === groupId && g.subgroups.find((s) => s.id === categoryId)
      )
    );
    
    if (isInSubgroup) {
      // Добавляем строку в таблицу подгруппы
      addTableRowInSubgroup(groupId, categoryId, table.id);
    } else if (groupId && categoryId) {
      // Добавляем строку в таблицу категории
      addTableRowInCategory(groupId, categoryId, table.id);
    } else if (groupId) {
      // Добавляем строку в таблицу группы
      addTableRowInGroup(groupId, table.id);
    } else {
      // Добавляем строку в обычную таблицу
      addTableRow(table.id);
    }
  };

  const handleAddColumn = () => {
    // Определяем, находится ли ячейка в подгруппе
    const isInSubgroup = groupId && categoryId && !!cycles?.find((c) => 
      c.groups.find((g) => 
        g.id === groupId && g.subgroups.find((s) => s.id === categoryId)
      )
    );
    
    if (isInSubgroup) {
      // Добавляем столбец в таблицу подгруппы
      addTableColumnInSubgroup(groupId, categoryId, table.id);
    } else if (groupId && categoryId) {
      // Добавляем столбец в таблицу категории
      addTableColumnInCategory(groupId, categoryId, table.id);
    } else if (groupId) {
      // Добавляем столбец в таблицу группы
      addTableColumnInGroup(groupId, table.id);
    } else {
      // Добавляем столбец в обычную таблицу
      addTableColumn(table.id);
    }
  };

  // Обработчик для удаления строки и столбца
  const handleRemoveRow = () => {
    if (table.rows.length <= 1) return; // Не удаляем последнюю строку
    
    // Определяем, находится ли ячейка в подгруппе
    const isInSubgroup = groupId && categoryId && !!cycles?.find((c) => 
      c.groups.find((g) => 
        g.id === groupId && g.subgroups.find((s) => s.id === categoryId)
      )
    );
    
    if (isInSubgroup) {
      // Удаляем строку из таблицы подгруппы
      removeTableRowInSubgroup(groupId, categoryId, table.id, table.rows.length - 1);
    } else if (groupId && categoryId) {
      // Удаляем строку из таблицы категории
      removeTableRowInCategory(groupId, categoryId, table.id, table.rows.length - 1);
    } else if (groupId) {
      // Удаляем строку из таблицы группы
      removeTableRowInGroup(groupId, table.id, table.rows.length - 1);
    } else {
      // Удаляем строку из обычной таблицы
      removeTableRow(table.id, table.rows.length - 1);
    }
  };

  const handleRemoveColumn = () => {
    if (table.columns <= 1) return; // Не удаляем последний столбец
    
    // Определяем, находится ли ячейка в подгруппе
    const isInSubgroup = groupId && categoryId && !!cycles?.find((c) => 
      c.groups.find((g) => 
        g.id === groupId && g.subgroups.find((s) => s.id === categoryId)
      )
    );
    
    if (isInSubgroup) {
      // Удаляем столбец из таблицы подгруппы
      removeTableColumnInSubgroup(groupId, categoryId, table.id, table.columns - 1);
    } else if (groupId && categoryId) {
      // Удаляем столбец из таблицы категории
      removeTableColumnInCategory(groupId, categoryId, table.id, table.columns - 1);
    } else if (groupId) {
      // Удаляем столбец из таблицы группы
      removeTableColumnInGroup(groupId, table.id, table.columns - 1);
    } else {
      // Удаляем столбец из обычной таблицы
      removeTableColumn(table.id, table.columns - 1);
    }
  };

  // Эффект для закрытия редактора ячейки при выходе из режима редактирования
  useEffect(() => {
    if (!isEditorMode && activeCell) {
      setActiveCell(null);
    }
  }, [isEditorMode, activeCell]);

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden mb-6"
    >
      {/* Строка с инструментами для редактирования и drag-and-drop */}
      {isEditorMode && (
        <div className="bg-gray-50 p-2 border-b flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div
              className="flex items-center p-1.5 text-blue-600 rounded-md hover:bg-gray-100 transition-all duration-200 cursor-pointer"
              title="Размеры таблицы"
              onClick={() => setShowSizeEditor(!showSizeEditor)}
            >
              <Columns size={16} className="mr-1" />
              <span className="text-xs font-medium">{table.rows.length} × {table.columns}</span>
            </div>
            
            {/* Редактор размеров */}
            {showSizeEditor && (
              <div className="flex items-center bg-white p-1 rounded-md border shadow-sm">
                {/* Редактор строк */}
                <div className="flex items-center mr-3">
                  <span className="text-xs mr-1.5 text-gray-500">Строки:</span>
                  <button
                    onClick={handleRemoveRow}
                    className="p-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
                    disabled={table.rows.length <= 1}
                    title="Удалить строку"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="mx-1.5 text-xs font-medium">{table.rows.length}</span>
                  <button
                    onClick={handleAddRow}
                    className="p-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all duration-200"
                    title="Добавить строку"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                
                {/* Редактор столбцов */}
                <div className="flex items-center">
                  <span className="text-xs mr-1.5 text-gray-500">Столбцы:</span>
                  <button
                    onClick={handleRemoveColumn}
                    className="p-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
                    disabled={table.columns <= 1}
                    title="Удалить столбец"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="mx-1.5 text-xs font-medium">{table.columns}</span>
                  <button
                    onClick={handleAddColumn}
                    className="p-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all duration-200"
                    title="Добавить столбец"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {draggable && (
              <div 
                className="cursor-grab active:cursor-grabbing p-1.5 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                draggable={true}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              >
                <GripVertical size={16} />
              </div>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete()}
                className="p-1.5 bg-gray-100 rounded-md hover:bg-red-100 hover:text-red-600 transition-all duration-200"
                title="Удалить таблицу"
              >
                <Trash size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Заголовок таблицы, отображается только если hideHeader равен false */}
      {!hideHeader && (
        <div 
          className={`py-3 px-4 flex justify-between items-center bg-gradient-to-r ${table.gradient || 'from-blue-500 via-indigo-500 to-violet-600'}`}
        >
          <h3 className="text-lg font-semibold text-white">{table.name}</h3>
          {isEditorMode && (
            <div className="flex items-center space-x-2">
              {onColorChange && (
                <button
                  onClick={onColorChange}
                  className="p-1.5 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all duration-200"
                  title="Изменить цвет"
                >
                  <Settings size={16} />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-1.5 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all duration-200"
                  title="Редактировать таблицу"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Размер таблицы (для режима редактирования), отображается только если hideHeader равен false */}
      {isEditorMode && !hideHeader && (
        <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600 border-b">
          Размер: {tableSize}
        </div>
      )}

      {/* Содержимое таблицы */}
      <div className="p-4 relative" style={{ overflow: 'visible' }}>
        <div className="relative" style={{ overflow: 'visible' }}>
          <table className="w-full border-collapse table-fixed">
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
                        className={`relative border border-gray-200 ${
                          isFirstRow ? 'bg-gray-50' : ''
                        } ${isActiveCell ? 'p-0' : 'p-2'}`}
                        onMouseEnter={() => isEditorMode && setShowColumnControls(cellIndex)}
                        onMouseLeave={() => setShowColumnControls(null)}
                        onClick={() => isEditorMode && !isActiveCell && handleCellClick(rowIndex, cellIndex)}
                      >
                        {isActiveCell ? (
                          <div className="cell-editor-container quill-wrapper">
                            <style dangerouslySetInnerHTML={{ __html: `
                              /* Убираем отступы для редактора в ячейке */
                              .table-cell-editor .ql-toolbar {
                                border-top: none;
                                border-left: none;
                                border-right: none;
                                padding: 5px;
                                background: #f8fafc;
                              }
                              .table-cell-editor .ql-container {
                                border: none;
                                font-size: 0.875rem;
                                min-height: 80px;
                              }
                              .table-cell-editor .ql-editor {
                                padding: 0.5rem;
                                min-height: 80px;
                              }
                              .table-cell-editor .ql-editor p {
                                margin-bottom: 0.25rem;
                              }
                            `}} />
                            <div className="table-cell-editor">
                              <ReactQuill
                                value={cellContent}
                                onChange={handleCellChange}
                                modules={modules}
                                formats={formats}
                                placeholder="Введите текст..."
                                theme="snow"
                              />
                              <div className="flex justify-end p-2 bg-gray-50 border-t">
                                <button
                                  type="button"
                                  onClick={handleCloseEditor}
                                  className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors close-editor-btn"
                                >
                                  Готово
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="min-h-[40px] overflow-auto prose prose-sm max-w-none 
                              prose-headings:my-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 
                              prose-li:my-0.5 prose-strong:font-bold prose-em:italic"
                            dangerouslySetInnerHTML={{ __html: cell.content || '' }}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableComponent; 