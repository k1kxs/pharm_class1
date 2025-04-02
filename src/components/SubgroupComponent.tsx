import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Edit, Trash, Plus, CornerDownRight, ArrowRight } from 'lucide-react';
import { Subgroup, Category, Table } from './types';
import CategoryComponent from './CategoryComponent';
import TableComponent from './TableComponent';
import { useDrugClassification } from './context/DrugClassificationContext';

interface SubgroupComponentProps {
  subgroup: Subgroup;
  groupId: number;
  cycleId: number;
  isEditorMode: boolean;
  isEditingTitle?: number | null;
  editingTitleValue?: string;
  onStartEditingTitle?: (type: string, item: any) => void;
  onFinishEditingTitle?: (type: string, id: number) => void;
  onEditingTitleChange?: (value: string) => void;
  onDeleteItem: (type: string, id: number) => void;
  onOpenEditor: (type: 'cycle' | 'group' | 'subgroup' | 'category' | 'table', parentId?: number) => void;
  searchQuery?: string;
  handleDeleteMedications?: (type: string, id: number) => void;
  openTableModal?: (groupId?: number, categoryId?: number) => void;
}

const SubgroupComponent: React.FC<SubgroupComponentProps> = ({
  subgroup,
  groupId,
  cycleId,
  isEditorMode,
  isEditingTitle,
  editingTitleValue,
  onStartEditingTitle,
  onFinishEditingTitle,
  onEditingTitleChange,
  onDeleteItem,
  onOpenEditor,
  handleDeleteMedications,
  openTableModal
}) => {
  const [isSubgroupExpanded, setIsSubgroupExpanded] = React.useState(true);
  const [isEditingMedications, setIsEditingMedications] = React.useState(true);
  const [showEmptyMedicationsPlaceholder, setShowEmptyMedicationsPlaceholder] = React.useState(false);
  
  // Состояния для drag-and-drop таблиц
  const [draggedTable, setDraggedTable] = useState<Table | null>(null);
  const [dragOverTable, setDragOverTable] = useState<Table | null>(null);
  
  // Получаем функции для работы с таблицами из контекста
  const {
    moveTableInSubgroup,
    updateSubgroupTableCell,
    addTableRowInSubgroup,
    addTableColumnInSubgroup,
    removeTableRowInSubgroup,
    removeTableColumnInSubgroup,
    removeSubgroupTable
  } = useDrugClassification();
  
  // Обработчики для перетаскивания таблиц
  const handleTableDragStart = (e: React.DragEvent<HTMLDivElement>, table: Table) => {
    // Остановка распространения события
    e.stopPropagation();
    // Установка передаваемых данных
    e.dataTransfer.setData('text/plain', table.id.toString());
    // Установка эффекта перетаскивания
    e.dataTransfer.effectAllowed = 'move';
    // Установка перетаскиваемой таблицы
    setDraggedTable(table);
  };
  
  const handleTableDragOver = (e: React.DragEvent<HTMLDivElement>, table: Table) => {
    e.preventDefault();
    if (draggedTable && draggedTable.id !== table.id) {
      setDragOverTable(table);
    }
  };
  
  const handleTableDrop = (e: React.DragEvent<HTMLDivElement>, targetTable: Table) => {
    e.preventDefault();
    
    if (draggedTable && draggedTable.id !== targetTable.id && subgroup.tables) {
      // Найти индексы перетаскиваемой и целевой таблиц
      const draggedIndex = subgroup.tables.findIndex(t => t.id === draggedTable.id);
      const targetIndex = subgroup.tables.findIndex(t => t.id === targetTable.id);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Используем функцию из контекста для перемещения таблиц
        moveTableInSubgroup(groupId, subgroup.id, draggedIndex, targetIndex);
      }
    }
    
    setDraggedTable(null);
    setDragOverTable(null);
  };
  
  const handleTableDragEnd = () => {
    setDraggedTable(null);
    setDragOverTable(null);
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm transition-all duration-200 hover:shadow subgroup-component mb-4 last:mb-0">
      <div className="p-2 pl-0 flex justify-between items-center rounded-lg hover:bg-gray-50 transition-colors duration-200">
        <div className="flex-1 flex items-center min-w-0 overflow-hidden mr-2">
          
          {isEditingTitle === subgroup.id ? (
            <div className="flex items-center w-full max-w-md">
              <input
                type="text"
                value={editingTitleValue || ''}
                onChange={(e) => onEditingTitleChange && onEditingTitleChange(e.target.value)}
                className="border rounded-md px-3 py-1.5 mr-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none shadow-sm"
                autoFocus
              />
              <button
                onClick={() => onFinishEditingTitle && onFinishEditingTitle('subgroup', subgroup.id)}
                className="p-1.5 bg-blue-100 rounded-md text-blue-700 hover:bg-blue-200 transition-all duration-200 flex-shrink-0"
              >
                <Edit size={16} />
              </button>
            </div>
          ) : (
            <div 
              className="group flex items-center cursor-pointer flex-1 min-w-0 overflow-hidden -ml-2"
              onClick={() => setIsSubgroupExpanded(!isSubgroupExpanded)}
            >
              <div className="flex items-center transition-transform duration-200 flex-shrink-0">
                {isSubgroupExpanded ? 
                  <ChevronDown size={16} className="text-indigo-500 mr-3" /> : 
                  <ChevronRight size={16} className="text-indigo-500 mr-3 transition-transform duration-200 group-hover:translate-x-1" />
                }
              </div>
              
              <h4 className="text-lg font-bold flex items-center text-gray-700 min-w-0 max-w-full">
                <span className="break-words break-all whitespace-normal w-full">{subgroup.name}</span>
                {isEditorMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartEditingTitle && onStartEditingTitle('subgroup', subgroup);
                    }}
                    className="ml-2 p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0"
                  >
                    <Edit size={12} className="text-gray-600" />
                  </button>
                )}
              </h4>
            </div>
          )}
        </div>
        {isEditorMode && (
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => onDeleteItem('subgroup', subgroup.id)}
              className="p-1.5 bg-gray-100 rounded-md hover:bg-red-100 hover:text-red-600 transition-all duration-200"
              title="Удалить подгруппу"
            >
              <Trash size={14} />
            </button>
          </div>
        )}
      </div>
      
      {isSubgroupExpanded && (
        <div className="p-3 bg-gray-50 rounded-b-lg border-t scale-in">
          {isEditorMode && (
            <div className="flex justify-start mb-4">
              <button
                onClick={() => onOpenEditor('category', subgroup.id)}
                className="px-3 py-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-all duration-200 flex items-center text-sm shadow-sm mr-3"
              >
                <Plus size={14} className="mr-1.5" />
                <span className="font-medium">Добавить категорию</span>
              </button>
              <button
                onClick={() => openTableModal ? openTableModal(groupId, subgroup.id) : onOpenEditor('table', subgroup.id)}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all duration-200 flex items-center text-sm shadow-sm mr-3"
              >
                <Plus size={14} className="mr-1.5" />
                <span className="font-medium">Добавить таблицу</span>
              </button>
              {!subgroup.preparations && (
                <button
                  onClick={() => setShowEmptyMedicationsPlaceholder(true)}
                  className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-all duration-200 flex items-center text-sm shadow-sm"
                >
                  <Plus size={14} className="mr-1.5" />
                  <span className="font-medium">Добавить препараты</span>
                </button>
              )}
            </div>
          )}

          {/* Таблицы подгруппы, если они есть */}
          {subgroup.tables && subgroup.tables.length > 0 && (
            <div className="mb-4">
              <div className="space-y-4">
                {subgroup.tables.map((table) => (
                  <TableComponent
                    key={table.id}
                    table={table}
                    isEditorMode={isEditorMode}
                    hideHeader={true}
                    groupId={groupId}
                    categoryId={subgroup.id}
                    onDelete={() => removeSubgroupTable(groupId, subgroup.id, table.id)}
                    draggable={isEditorMode}
                    onDragStart={(e) => handleTableDragStart(e, table)}
                    onDragOver={(e) => handleTableDragOver(e, table)}
                    onDrop={(e) => handleTableDrop(e, table)}
                    onDragEnd={handleTableDragEnd}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Препараты подгруппы, если есть */}
          {(subgroup.preparations || (isEditorMode && showEmptyMedicationsPlaceholder)) && (
            <div className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 category-component mb-4">
              <div className="flex justify-between items-start">
                <div className="w-1/3 pr-4 min-w-0 overflow-hidden">
                  {/* Здесь может быть заголовок или описание, если нужно */}
                </div>
                
                <div className="w-2-3">
                  {subgroup.preparations ? (
                    <div>
                      <div>
                        <div 
                          className="text-sm text-gray-700 formatted-preparations prep-container bg-gray-50 p-3 rounded-md"
                          dangerouslySetInnerHTML={{ 
                            __html: subgroup.preparations
                          }}
                        />
                      </div>
                      {isEditorMode && (
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={() => onOpenEditor('subgroup', subgroup.id)}
                            className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all duration-200 flex items-center text-xs shadow-sm"
                          >
                            <Edit size={12} className="mr-1" />
                            Редактировать препараты
                          </button>
                        </div>
                      )}
                    </div>
                  ) : isEditorMode && showEmptyMedicationsPlaceholder && (
                    <div>
                      <div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md border border-dashed border-gray-300">
                          <div className="text-sm text-gray-500">Нет данных о препаратах</div>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => onOpenEditor('subgroup', subgroup.id)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all duration-200 flex items-center text-xs shadow-sm"
                        >
                          <Edit size={12} className="mr-1" />
                          Редактировать препараты
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {isEditorMode && subgroup.preparations && (
                  <button
                    onClick={() => {
                      handleDeleteMedications && handleDeleteMedications('subgroup', subgroup.id);
                      setShowEmptyMedicationsPlaceholder(false);
                    }}
                    className="p-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-all duration-200 flex-shrink-0 ml-2"
                    title="Удалить препараты"
                  >
                    <Trash size={14} />
                  </button>
                )}
                
                {isEditorMode && !subgroup.preparations && showEmptyMedicationsPlaceholder && (
                  <button
                    onClick={() => {
                      handleDeleteMedications && handleDeleteMedications('subgroup', subgroup.id);
                      setShowEmptyMedicationsPlaceholder(false);
                    }}
                    className="p-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-all duration-200 flex-shrink-0 ml-2"
                    title="Удалить препараты"
                  >
                    <Trash size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
          
          {subgroup.categories && subgroup.categories.length > 0 ? (
            subgroup.categories.map((category: Category) => (
              <CategoryComponent
                key={category.id}
                category={category}
                subgroupId={subgroup.id}
                groupId={groupId}
                cycleId={cycleId}
                isEditorMode={isEditorMode}
                isEditingTitle={isEditingTitle}
                editingTitleValue={editingTitleValue}
                onStartEditingTitle={onStartEditingTitle}
                onFinishEditingTitle={onFinishEditingTitle}
                onEditingTitleChange={onEditingTitleChange}
                onDeleteItem={onDeleteItem}
                onOpenEditor={onOpenEditor}
                handleDeleteMedications={handleDeleteMedications}
              />
            ))
          ) : isEditorMode ? (
            <div className="text-center text-gray-500 p-3 bg-white rounded-lg text-sm border border-gray-100">
              <p>Добавьте категорию с помощью кнопки выше</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SubgroupComponent;