import React from 'react';
import { ChevronDown, ChevronRight, Edit, Trash, Palette, Plus, MoveVertical } from 'lucide-react';
import { Cycle, Group } from './types';
import GroupComponent from './GroupComponent';
import { useDrugClassification } from './context/DrugClassificationContext';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CycleComponentProps {
  cycle: Cycle;
  isSelected: boolean;
  isEditorMode: boolean;
  isEditingTitle: number | null;
  editingTitleValue: string;
  draggedCycle: Cycle | null;
  dragOverCycle: Cycle | null;
  onToggleCycle: (cycleId: number) => void;
  onStartEditingTitle: (type: string, item: any) => void;
  onFinishEditingTitle: (type: string, id: number) => void;
  onEditingTitleChange: (value: string) => void;
  onOpenColorPicker: (itemId: number, itemType?: 'cycle' | 'group') => void;
  onDeleteItem: (type: string, id: number) => void;
  onOpenEditor: (type: string, parentId?: number) => void;
  // Обработчики перетаскивания
  onCycleDragStart: (e: React.DragEvent, cycle: Cycle) => void;
  onCycleDragOver: (e: React.DragEvent, cycle: Cycle) => void;
  onCycleDrop: (e: React.DragEvent, cycle: Cycle) => void;
  onCycleDragEnd: () => void;
  onGroupDragStart: (e: React.DragEvent, group: Group, cycleId: number) => void;
  onGroupDragOver: (e: React.DragEvent, group: Group, cycleId: number) => void;
  onGroupDrop: (e: React.DragEvent, group: Group, cycleId: number) => void;
  onGroupDragEnd: () => void;
}

const CycleComponent: React.FC<CycleComponentProps> = ({
  cycle,
  isSelected,
  isEditorMode,
  isEditingTitle,
  editingTitleValue,
  draggedCycle,
  dragOverCycle,
  onToggleCycle,
  onStartEditingTitle,
  onFinishEditingTitle,
  onEditingTitleChange,
  onOpenColorPicker,
  onDeleteItem,
  onOpenEditor,
  onCycleDragStart,
  onCycleDragOver,
  onCycleDrop,
  onCycleDragEnd,
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
    disabled: !isEditorMode || isEditingTitle === cycle.id
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
      className={`rounded-xl overflow-hidden shadow-md transition-all duration-300 bg-white ${
        dragOverCycle?.id === cycle.id ? 'border-2 border-blue-500 scale-[1.01]' : ''
      } ${
        draggedCycle?.id === cycle.id ? 'opacity-60 rotate-1' : ''
      } hover:shadow-lg`}
      draggable={isEditorMode}
      onDragStart={(e) => onCycleDragStart(e, cycle)}
      onDragOver={(e) => onCycleDragOver(e, cycle)}
      onDrop={(e) => onCycleDrop(e, cycle)}
      onDragEnd={onCycleDragEnd}
    >
      {/* Заголовок цикла */}
      <div 
        className={`bg-gradient-to-r ${cycle.gradient || ''} p-4 flex justify-between items-center text-gray-800 ${!cycle.gradient || cycle.gradient === '' ? 'bg-gray-100' : ''}`}
      >
        <div className="flex-1 min-w-0 overflow-hidden mr-2">
          {isEditingTitle === cycle.id ? (
            <div className="flex items-center w-full max-w-md">
              <input
                type="text"
                value={editingTitleValue}
                onChange={(e) => onEditingTitleChange(e.target.value)}
                className="border rounded-md px-3 py-1.5 mr-2 w-full text-black focus:ring-2 focus:ring-white focus:border-transparent focus:outline-none shadow-sm"
                autoFocus
              />
              <button
                onClick={() => onFinishEditingTitle('cycle', cycle.id)}
                className="p-1.5 bg-white rounded-md text-gray-700 hover:bg-gray-200 transition-all duration-200 flex-shrink-0"
              >
                <Edit size={16} />
              </button>
            </div>
          ) : (
            <div 
              className="group flex items-center cursor-pointer overflow-hidden"
              onClick={() => onToggleCycle(cycle.id)}
            >
              <div className="flex items-center transition-transform duration-200 flex-shrink-0">
                {isSelected ? 
                  <ChevronDown size={22} className="mr-2 transition-transform duration-200" /> : 
                  <ChevronRight size={22} className="mr-2 transition-transform duration-200 group-hover:translate-x-1" />
                }
              </div>
              
              <h2 className="text-xl font-bold flex items-center px-2 py-1 bg-white/60 rounded-md backdrop-blur-sm min-w-0 max-w-full">
                <span className="break-words break-all whitespace-normal w-full">{cycle.name}</span>
                {isEditorMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartEditingTitle('cycle', cycle);
                    }}
                    className="ml-2 p-1.5 bg-white rounded-full hover:bg-gray-200 transition-all duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0"
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
                className="cursor-grab active:cursor-grabbing flex items-center p-1.5 bg-white rounded-md hover:bg-gray-200 transition-all duration-200"
                {...listeners}
              >
                <MoveVertical size={16} className="text-gray-700" />
              </div>
            )}
            <button
              onClick={() => onOpenColorPicker(cycle.id, 'cycle')}
              className="p-1.5 bg-white rounded-md hover:bg-gray-200 transition-all duration-200"
              title="Изменить цвет цикла"
            >
              <Palette size={16} className="text-gray-700" />
            </button>
            <button
              onClick={() => onDeleteItem('cycle', cycle.id)}
              className="p-1.5 bg-white rounded-md hover:bg-gray-200 hover:text-red-600 transition-all duration-200"
              title="Удалить цикл"
            >
              <Trash size={16} className="text-gray-700" />
            </button>
          </div>
        )}
      </div>
      
      {/* Содержимое цикла */}
      {isSelected && (
        <div className="p-4 scale-in">
          {isEditorMode && (
            <div className="mb-4 flex justify-start">
              <button
                onClick={() => onOpenEditor('group', cycle.id)}
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
                  isEditingTitle={isEditingTitle}
                  editingTitleValue={editingTitleValue}
                  onStartEditingTitle={onStartEditingTitle}
                  onFinishEditingTitle={onFinishEditingTitle}
                  onEditingTitleChange={onEditingTitleChange}
                  onDeleteItem={onDeleteItem}
                  onOpenEditor={(type, parentId) => onOpenEditor(type, parentId)}
                  onOpenColorPicker={onOpenColorPicker}
                  onGroupDragStart={onGroupDragStart}
                  onGroupDragOver={onGroupDragOver}
                  onGroupDrop={onGroupDrop}
                  onGroupDragEnd={onGroupDragEnd}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-lg">
              {isEditorMode ? (
                <p>Добавьте группу с помощью кнопки выше</p>
              ) : (
                <p>В данном цикле нет групп</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CycleComponent; 