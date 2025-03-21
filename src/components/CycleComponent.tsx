import React from 'react';
import { ChevronDown, ChevronRight, Edit, Trash, Palette, Plus } from 'lucide-react';
import { Cycle, Group } from './types';
import GroupComponent from './GroupComponent';
import { useDrugClassification } from './context/DrugClassificationContext';

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
  onOpenColorPicker: (cycleId: number) => void;
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
  // Можно получить дополнительные данные из контекста при необходимости
  // const { ... } = useDrugClassification();
  
  return (
    <div 
      key={cycle.id} 
      className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 bg-white ${
        dragOverCycle?.id === cycle.id ? 'border-2 border-blue-500' : ''
      } ${
        draggedCycle?.id === cycle.id ? 'opacity-50' : ''
      }`}
      draggable={isEditorMode}
      onDragStart={(e) => onCycleDragStart(e, cycle)}
      onDragOver={(e) => onCycleDragOver(e, cycle)}
      onDrop={(e) => onCycleDrop(e, cycle)}
      onDragEnd={onCycleDragEnd}
    >
      {/* Заголовок цикла */}
      <div 
        className={`bg-gradient-to-r ${cycle.gradient} text-white p-4 flex justify-between items-center`}
      >
        <div className="flex-1">
          {isEditingTitle === cycle.id ? (
            <div className="flex items-center">
              <input
                type="text"
                value={editingTitleValue}
                onChange={(e) => onEditingTitleChange(e.target.value)}
                className="border rounded px-2 py-1 mr-2 w-full text-black"
                autoFocus
              />
              <button
                onClick={() => onFinishEditingTitle('cycle', cycle.id)}
                className="p-1 bg-blue-100 rounded text-blue-800"
              >
                <Edit size={16} />
              </button>
            </div>
          ) : (
            <h2 
              className="text-xl font-bold flex items-center cursor-pointer"
              onClick={() => onToggleCycle(cycle.id)}
            >
              {isSelected ? <ChevronDown size={20} className="mr-2" /> : <ChevronRight size={20} className="mr-2" />}
              {cycle.name}
              {isEditorMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEditingTitle('cycle', cycle);
                  }}
                  className="ml-2 p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30"
                >
                  <Edit size={14} />
                </button>
              )}
            </h2>
          )}
        </div>
        {isEditorMode && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenColorPicker(cycle.id)}
              className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors duration-200"
              title="Изменить цвет цикла"
            >
              <Palette size={16} />
            </button>
            <button
              onClick={() => onDeleteItem('cycle', cycle.id)}
              className="p-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors duration-200"
              title="Удалить цикл"
            >
              <Trash size={16} />
            </button>
          </div>
        )}
      </div>
      
      {/* Содержимое цикла */}
      {isSelected && (
        <div className="p-4">
          {isEditorMode && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => onOpenEditor('group', cycle.id)}
                className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors duration-200 flex items-center text-sm"
              >
                <Plus size={14} className="mr-1" />
                Добавить группу
              </button>
            </div>
          )}
          
          <div className="space-y-6">
            {cycle.groups.length > 0 ? (
              cycle.groups.map((group) => (
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
                  onOpenEditor={onOpenEditor}
                  onGroupDragStart={onGroupDragStart}
                  onGroupDragOver={onGroupDragOver}
                  onGroupDrop={onGroupDrop}
                  onGroupDragEnd={onGroupDragEnd}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 p-6">
                Нет групп в этом цикле. {isEditorMode && "Добавьте новую группу с помощью кнопки выше."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CycleComponent; 