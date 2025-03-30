import React from 'react';
import { ChevronDown, ChevronRight, Edit, Trash, Palette, Plus, MoveVertical } from 'lucide-react';
import { Cycle, Group } from './types';
import GroupComponent from './GroupComponent';
import { useDrugClassification } from './context/DrugClassificationContext';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CycleComponentProps {
  cycle: Cycle;
  isExpanded: boolean;
  isEditorMode: boolean;
  isEditingTitle: boolean;
  editingTitleValue: string;
  searchQuery?: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onColorChange: () => void;
  onStartEditingTitle: () => void;
  onFinishEditingTitle: () => void;
  onEditingTitleChange: (value: string) => void;
  openEditModal: (type: 'cycle' | 'group' | 'subgroup' | 'category' | 'table', parentId?: number) => void;
  handleDelete: (type: string, id: number) => void;
  handleDeleteMedications?: (type: string, id: number) => void;
  onColorPickerOpen: (itemId: number, itemType?: 'cycle' | 'group' | 'table') => void;
  onTableAdd?: () => void;
  openTableModal?: (groupId?: number) => void;
  // Обработчики перетаскивания
  onDragStart: (e: React.DragEvent<HTMLDivElement>, cycle: Cycle) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, cycle: Cycle) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, cycle: Cycle) => void;
  onDragEnd: () => void;
  onGroupDragStart: (e: React.DragEvent<HTMLDivElement>, group: Group, cycleId: number) => void;
  onGroupDragOver: (e: React.DragEvent<HTMLDivElement>, group: Group, cycleId: number) => void;
  onGroupDrop: (e: React.DragEvent<HTMLDivElement>, group: Group, cycleId: number) => void;
  onGroupDragEnd: () => void;
}

const CycleComponent: React.FC<CycleComponentProps> = ({
  cycle,
  isExpanded,
  isEditorMode,
  isEditingTitle,
  editingTitleValue,
  searchQuery,
  onToggle,
  onEdit,
  onDelete,
  onColorChange,
  onStartEditingTitle,
  onFinishEditingTitle,
  onEditingTitleChange,
  openEditModal,
  handleDelete,
  handleDeleteMedications,
  onColorPickerOpen,
  onTableAdd,
  openTableModal,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onGroupDragStart,
  onGroupDragOver,
  onGroupDrop,
  onGroupDragEnd
}) => {
  // Используем хук useSortable из @dnd-kit/sortable для улучшенного drag-and-drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: cycle.id,
    data: {
      type: 'cycle',
      cycle
    },
    disabled: !isEditorMode || isEditingTitle
  });
  
  // Применяем стили для элемента при перетаскивании
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  };
  
  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      key={cycle.id} 
      className={`rounded-xl overflow-hidden shadow-md transition-all duration-300 bg-white hover:shadow-lg`}
      draggable={isEditorMode}
      onDragStart={(e) => onDragStart(e, cycle)}
      onDragOver={(e) => onDragOver(e, cycle)}
      onDrop={(e) => onDrop(e, cycle)}
      onDragEnd={onDragEnd}
    >
      {/* Заголовок цикла */}
      <div 
        className={`bg-gradient-to-r ${cycle.gradient || ''} p-4 flex justify-between items-center text-white ${!cycle.gradient || cycle.gradient === '' ? 'bg-gray-100' : ''}`}
      >
        <div className="flex-1 min-w-0 overflow-hidden mr-2">
          {isEditingTitle ? (
            <div className="flex items-center w-full max-w-md">
              <input
                type="text"
                value={editingTitleValue}
                onChange={(e) => onEditingTitleChange(e.target.value)}
                className="border rounded-md px-3 py-1.5 mr-2 w-full text-black focus:ring-2 focus:ring-white focus:border-transparent focus:outline-none shadow-sm"
                autoFocus
              />
              <button
                onClick={onFinishEditingTitle}
                className="p-1.5 bg-white rounded-md text-gray-700 hover:bg-gray-200 transition-all duration-200 flex-shrink-0"
              >
                <Edit size={16} />
              </button>
            </div>
          ) : (
            <div 
              className="group flex items-center cursor-pointer overflow-hidden"
              onClick={onToggle}
            >
              <div className="flex items-center transition-transform duration-200 flex-shrink-0">
                {isExpanded ? 
                  <ChevronDown size={22} className="mr-2 transition-transform duration-200" /> : 
                  <ChevronRight size={22} className="mr-2 transition-transform duration-200 group-hover:translate-x-1" />
                }
              </div>
              
              <h2 className="text-xl font-bold flex items-center px-2 py-1 min-w-0 max-w-full">
                <span className="break-words break-all whitespace-normal w-full golden-gradient-text">{cycle.name}</span>
                {isEditorMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartEditingTitle();
                    }}
                    className="ml-2 p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0"
                  >
                    <Edit size={14} className="text-gray-700" />
                  </button>
                )}
              </h2>
            </div>
          )}
        </div>
        {isEditorMode && (
          <div className="flex items-center space-x-2 flex-shrink-0">
            {!isEditingTitle && (
              <div 
                className="cursor-grab active:cursor-grabbing flex items-center p-1.5 bg-white/20 rounded-md hover:bg-white/30 transition-all duration-200"
                {...listeners}
              >
                <MoveVertical size={16} className="text-white" />
              </div>
            )}
            <button
              onClick={onColorChange}
              className="p-1.5 bg-white/20 rounded-md hover:bg-white/30 transition-all duration-200"
              title="Изменить цвет цикла"
            >
              <Palette size={16} className="text-white" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 bg-white/20 rounded-md hover:bg-red-500/70 hover:text-white transition-all duration-200"
              title="Удалить цикл"
            >
              <Trash size={16} className="text-white" />
            </button>
          </div>
        )}
      </div>
      
      {/* Содержимое цикла */}
      {isExpanded && (
        <div className="p-4 scale-in">
          {isEditorMode && (
            <div className="mb-4 flex justify-start">
              <button
                onClick={() => openEditModal('group', cycle.id)}
                className="px-3 py-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-all duration-200 flex items-center text-sm shadow-sm"
              >
                <Plus size={14} className="mr-1.5" />
                <span className="font-medium">Добавить группу</span>
              </button>
            </div>
          )}
          
          {cycle.groups && cycle.groups.length > 0 ? (
            <div className="space-y-4">
              {cycle.groups.map((group) => (
                <GroupComponent
                  key={group.id}
                  group={group}
                  cycleId={cycle.id}
                  isEditorMode={isEditorMode}
                  isEditingTitle={null}
                  editingTitleValue={editingTitleValue}
                  onStartEditingTitle={() => {}}
                  onFinishEditingTitle={() => {}}
                  onEditingTitleChange={() => {}}
                  openEditModal={openEditModal}
                  handleDelete={handleDelete}
                  handleDeleteMedications={handleDeleteMedications}
                  onColorPickerOpen={onColorPickerOpen}
                  onDeleteItem={handleDelete}
                  onOpenEditor={openEditModal}
                  onOpenColorPicker={onColorPickerOpen}
                  onDragStart={onGroupDragStart}
                  onDragOver={onGroupDragOver}
                  onDrop={onGroupDrop}
                  onDragEnd={onGroupDragEnd}
                  searchQuery={searchQuery}
                  openTableModal={openTableModal}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 italic">
              Нет групп в этом цикле
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CycleComponent; 