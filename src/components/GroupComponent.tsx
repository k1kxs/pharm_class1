import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Edit, Trash, Plus, GripVertical, Palette } from 'lucide-react';
import { Group, Subgroup, Table } from './types';
import SubgroupComponent from './SubgroupComponent';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TableComponent from './TableComponent';
import { useDrugClassification } from './context/DrugClassificationContext';

interface GroupComponentProps {
  group: Group;
  cycleId: number;
  isEditorMode: boolean;
  isEditingTitle: number | null;
  editingTitleValue: string;
  onStartEditingTitle: (type: string, item: any) => void;
  onFinishEditingTitle: (type: string, id: number) => void;
  onEditingTitleChange: (value: string) => void;
  openEditModal: (type: 'cycle' | 'group' | 'subgroup' | 'category' | 'table', parentId?: number) => void;
  handleDelete: (type: string, id: number) => void;
  onColorPickerOpen: (itemId: number, itemType?: 'cycle' | 'group' | 'table') => void;
  // Обработчики перетаскивания групп
  onDragStart: (e: React.DragEvent<HTMLDivElement>, group: Group, cycleId: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, group: Group, cycleId: number) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, group: Group, cycleId: number) => void;
  onDragEnd: () => void;
  searchQuery?: string;
  onDeleteItem?: (type: string, id: number) => void;
  onOpenEditor?: (type: 'cycle' | 'group' | 'subgroup' | 'category' | 'table', parentId?: number) => void;
  onOpenColorPicker?: (itemId: number, itemType?: 'cycle' | 'group' | 'table') => void;
  handleDeleteMedications?: (type: string, id: number) => void;
  openTableModal?: (groupId?: number) => void;
}

const GroupComponent: React.FC<GroupComponentProps> = ({
  group,
  cycleId,
  isEditorMode,
  isEditingTitle,
  editingTitleValue,
  onStartEditingTitle,
  onFinishEditingTitle,
  onEditingTitleChange,
  openEditModal,
  handleDelete,
  onColorPickerOpen,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  searchQuery,
  onDeleteItem,
  onOpenEditor,
  onOpenColorPicker,
  handleDeleteMedications,
  openTableModal
}) => {
  const [isGroupExpanded, setIsGroupExpanded] = React.useState(false);
  const [isEditingMedications, setIsEditingMedications] = React.useState(true);
  const [showEmptyMedicationsPlaceholder, setShowEmptyMedicationsPlaceholder] = React.useState(false);
  
  // Состояния для drag-and-drop таблиц
  const [draggedTable, setDraggedTable] = useState<Table | null>(null);
  const [dragOverTable, setDragOverTable] = useState<Table | null>(null);
  
  // Используем хук useSortable из @dnd-kit/sortable для улучшенного drag-and-drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: group.id,
    data: {
      type: 'group',
      group,
      cycleId
    },
    disabled: !isEditorMode || isEditingTitle === group.id
  });
  
  // Применяем стили для элемента при перетаскивании
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 1000 : 1
  };

  // Получаем функцию moveTableInGroup из контекста
  const { moveTableInGroup } = useDrugClassification();

  // Обработчики для перетаскивания таблиц
  const handleTableDragStart = (e: React.DragEvent<HTMLDivElement>, table: Table) => {
    // Остановка распространения события, чтобы избежать перетаскивания родительского элемента
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
    
    if (draggedTable && draggedTable.id !== targetTable.id && group.tables) {
      // Найти индексы перетаскиваемой и целевой таблиц
      const draggedIndex = group.tables.findIndex(t => t.id === draggedTable.id);
      const targetIndex = group.tables.findIndex(t => t.id === targetTable.id);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Используем функцию из контекста для перемещения таблиц
        moveTableInGroup(group.id, draggedIndex, targetIndex);
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
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 bg-white group-component`}
      draggable={isEditorMode}
      onDragStart={(e) => onDragStart(e, group, cycleId)}
      onDragOver={(e) => onDragOver(e, group, cycleId)}
      onDrop={(e) => onDrop(e, group, cycleId)}
      onDragEnd={onDragEnd}
    >
      <div className={`p-3.5 ${group.gradient && group.gradient !== '' ? `bg-gradient-to-r ${group.gradient}` : 'bg-gradient-to-r from-gray-50 to-white'} rounded-t-lg border-b flex justify-between items-center text-white`}>
        <div className="flex-1 min-w-0 overflow-hidden mr-2">
          {isEditingTitle === group.id ? (
            <div className="flex items-center w-full max-w-md">
              <input
                type="text"
                value={editingTitleValue || ''}
                onChange={(e) => onEditingTitleChange && onEditingTitleChange(e.target.value)}
                className="border rounded-md px-3 py-1.5 mr-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none shadow-sm"
                autoFocus
              />
              <button
                onClick={() => onFinishEditingTitle && onFinishEditingTitle('group', group.id)}
                className="p-1.5 bg-white rounded-md text-gray-700 hover:bg-gray-200 transition-all duration-200 flex-shrink-0"
              >
                <Edit size={16} />
              </button>
            </div>
          ) : (
            <div 
              className="group flex items-center cursor-pointer overflow-hidden"
              onClick={() => setIsGroupExpanded(!isGroupExpanded)}
            >
              <div className="flex items-center transition-transform duration-200 flex-shrink-0">
                {isGroupExpanded ? 
                  <ChevronDown size={20} className="mr-2.5 text-white" /> : 
                  <ChevronRight size={20} className="mr-2.5 text-white transition-transform duration-200 group-hover:translate-x-1" />
                }
              </div>
              
              <h3 className="text-lg font-bold flex items-center px-2 py-1 min-w-0 max-w-full">
                <span className="break-words break-all whitespace-normal w-full">{group.name}</span>
                {isEditorMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartEditingTitle && onStartEditingTitle('group', group);
                    }}
                    className="ml-2 p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0"
                  >
                    <Edit size={14} className="text-gray-600" />
                  </button>
                )}
              </h3>
            </div>
          )}
        </div>
        {isEditorMode && (
          <div className="flex items-center space-x-2 flex-shrink-0">
            {!isEditingTitle && (
              <div 
                className="cursor-grab active:cursor-grabbing p-1.5 text-white hover:text-gray-100 transition-colors duration-200"
                {...listeners}
              >
                <GripVertical size={16} />
              </div>
            )}
            <button
              onClick={() => onColorPickerOpen(group.id, 'group')}
              className="p-1.5 bg-white/20 rounded-md hover:bg-white/30 transition-all duration-200"
              title="Изменить цвет группы"
            >
              <Palette size={16} className="text-white" />
            </button>
            <button
              onClick={() => handleDelete('group', group.id)}
              className="p-1.5 bg-white/20 rounded-md hover:bg-red-500/70 hover:text-white transition-all duration-200"
              title="Удалить группу"
            >
              <Trash size={16} className="text-white" />
            </button>
          </div>
        )}
      </div>
      
      {isGroupExpanded && (
        <div className="bg-white rounded-b-lg scale-in">
          {/* Горизонтальное расположение содержимого, с названиями слева и препаратами справа */}
          <div className="flex flex-col">
            {isEditorMode && (
              <div className="flex justify-start px-4 pt-4 mb-4">
                <button
                  onClick={() => openEditModal('subgroup', group.id)}
                  className="px-3 py-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-all duration-200 flex items-center text-sm shadow-sm mr-3"
                >
                  <Plus size={14} className="mr-1.5" />
                  <span className="font-medium">Добавить подгруппу</span>
                </button>
                <button
                  onClick={() => openTableModal ? openTableModal(group.id) : openEditModal('table', group.id)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all duration-200 flex items-center text-sm shadow-sm mr-3"
                >
                  <Plus size={14} className="mr-1.5" />
                  <span className="font-medium">Добавить таблицу</span>
                </button>
                {!group.preparations && (
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

            {/* Таблицы группы, если они есть */}
            {group.tables && group.tables.length > 0 && (
              <div className="px-4 mb-4">
                <div className="space-y-4">
                  {group.tables.map((table) => (
                    <TableComponent
                      key={table.id}
                      table={table}
                      isEditorMode={isEditorMode}
                      hideHeader={true}
                      groupId={group.id}
                      onDelete={() => handleDelete && handleDelete('table', table.id)}
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

            {/* Препараты группы, если есть */}
            {(group.preparations || (isEditorMode && showEmptyMedicationsPlaceholder)) && (
              <div className="px-4">
                <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                  {/* Блок для препаратов группы */}
                  <div className="w-full">
                    <div className="flex justify-between items-start">
                      <div className="w-1/3 pr-4 min-w-0 overflow-hidden">
                        {/* Здесь может быть заголовок или описание, если нужно */}
                      </div>
                      
                      <div className="w-2-3">
                        {group.preparations ? (
                          <div>
                            <div>
                              <div 
                                className="text-sm text-gray-700 formatted-preparations prep-container bg-gray-50 p-3 rounded-md"
                                dangerouslySetInnerHTML={{ 
                                  __html: group.preparations
                                }}
                              />
                            </div>
                            {isEditorMode && (
                              <div className="mt-2 flex justify-end">
                                <button
                                  onClick={() => onOpenEditor ? onOpenEditor('group', group.id) : openEditModal('group', group.id)}
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
                                onClick={() => onOpenEditor ? onOpenEditor('group', group.id) : openEditModal('group', group.id)}
                                className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all duration-200 flex items-center text-xs shadow-sm"
                              >
                                <Edit size={12} className="mr-1" />
                                Редактировать препараты
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {isEditorMode && group.preparations && (
                        <button
                          onClick={() => {
                            handleDeleteMedications && handleDeleteMedications('group', group.id);
                            setShowEmptyMedicationsPlaceholder(false);
                          }}
                          className="p-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-all duration-200 flex-shrink-0 ml-2"
                          title="Удалить препараты"
                        >
                          <Trash size={14} />
                        </button>
                      )}
                      
                      {isEditorMode && !group.preparations && showEmptyMedicationsPlaceholder && (
                        <button
                          onClick={() => {
                            handleDeleteMedications && handleDeleteMedications('group', group.id);
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
                </div>
              </div>
            )}
            
            {/* Подгруппы */}
            {group.subgroups && group.subgroups.length > 0 ? (
              <div className="px-4 pb-4 mt-5 subgroups-container">
                {group.subgroups.map((subgroup) => (
                  <SubgroupComponent
                    key={subgroup.id}
                    subgroup={subgroup}
                    groupId={group.id}
                    cycleId={cycleId}
                    isEditorMode={isEditorMode}
                    isEditingTitle={isEditingTitle}
                    editingTitleValue={editingTitleValue}
                    onStartEditingTitle={onStartEditingTitle}
                    onFinishEditingTitle={onFinishEditingTitle}
                    onEditingTitleChange={onEditingTitleChange}
                    onDeleteItem={(type, id) => onDeleteItem ? onDeleteItem(type, id) : handleDelete(type, id)}
                    onOpenEditor={(type, parentId) => onOpenEditor ? onOpenEditor(type as 'cycle' | 'group' | 'subgroup' | 'category' | 'table', parentId) : openEditModal(type, parentId)}
                    handleDeleteMedications={handleDeleteMedications}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupComponent; 