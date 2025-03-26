import React from 'react';
import { ChevronDown, ChevronRight, Edit, Trash, Plus, GripVertical, Palette } from 'lucide-react';
import { Group, Subgroup } from './types';
import SubgroupComponent from './SubgroupComponent';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface GroupComponentProps {
  group: Group;
  cycleId: number;
  isEditorMode: boolean;
  isEditingTitle: number | null;
  editingTitleValue: string;
  onStartEditingTitle: (type: string, item: any) => void;
  onFinishEditingTitle: (type: string, id: number) => void;
  onEditingTitleChange: (value: string) => void;
  onDeleteItem: (type: string, id: number) => void;
  onOpenEditor: (type: string, parentId?: number) => void;
  onOpenColorPicker: (itemId: number, itemType?: 'cycle' | 'group') => void;
  // Обработчики перетаскивания групп
  onGroupDragStart: (e: React.DragEvent, group: Group, cycleId: number) => void;
  onGroupDragOver: (e: React.DragEvent, group: Group, cycleId: number) => void;
  onGroupDrop: (e: React.DragEvent, group: Group, cycleId: number) => void;
  onGroupDragEnd: () => void;
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
  onDeleteItem,
  onOpenEditor,
  onOpenColorPicker,
  onGroupDragStart,
  onGroupDragOver,
  onGroupDrop,
  onGroupDragEnd
}) => {
  const [isGroupExpanded, setIsGroupExpanded] = React.useState(false);
  
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

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 bg-white group-component`}
      draggable={isEditorMode}
      onDragStart={(e) => onGroupDragStart(e, group, cycleId)}
      onDragOver={(e) => onGroupDragOver(e, group, cycleId)}
      onDrop={(e) => onGroupDrop(e, group, cycleId)}
      onDragEnd={onGroupDragEnd}
    >
      <div className={`p-3.5 ${group.gradient && group.gradient !== '' ? `bg-gradient-to-r ${group.gradient}` : 'bg-gradient-to-r from-gray-50 to-white'} rounded-t-lg border-b flex justify-between items-center text-gray-800`}>
        <div className="flex-1 min-w-0 overflow-hidden mr-2">
          {isEditingTitle === group.id ? (
            <div className="flex items-center w-full max-w-md">
              <input
                type="text"
                value={editingTitleValue}
                onChange={(e) => onEditingTitleChange(e.target.value)}
                className="border rounded-md px-3 py-1.5 mr-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none shadow-sm"
                autoFocus
              />
              <button
                onClick={() => onFinishEditingTitle('group', group.id)}
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
                  <ChevronDown size={20} className="mr-2.5 text-blue-600" /> : 
                  <ChevronRight size={20} className="mr-2.5 text-blue-600 transition-transform duration-200 group-hover:translate-x-1" />
                }
              </div>
              
              <h3 className="text-lg font-medium flex items-center px-2 py-1 bg-white/60 rounded-md backdrop-blur-sm min-w-0 max-w-full">
                <span className="break-words break-all whitespace-normal w-full">{group.name}</span>
                {isEditorMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartEditingTitle('group', group);
                    }}
                    className="ml-2 p-1.5 bg-white rounded-full hover:bg-gray-200 transition-all duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0"
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
                className="cursor-grab active:cursor-grabbing p-1.5 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                {...listeners}
              >
                <GripVertical size={16} />
              </div>
            )}
            <button
              onClick={() => onOpenColorPicker(group.id, 'group')}
              className="p-1.5 bg-white rounded-md hover:bg-gray-200 transition-all duration-200"
              title="Изменить цвет группы"
            >
              <Palette size={16} className="text-gray-600" />
            </button>
            <button
              onClick={() => onDeleteItem('group', group.id)}
              className="p-1.5 bg-white rounded-md hover:bg-red-100 hover:text-red-600 transition-all duration-200"
              title="Удалить группу"
            >
              <Trash size={16} className="text-gray-600" />
            </button>
          </div>
        )}
      </div>
      
      {isGroupExpanded && (
        <div className="p-4 bg-white rounded-b-lg scale-in">
          {/* Горизонтальное расположение содержимого, с названиями слева и препаратами справа */}
          <div className="flex flex-col space-y-4">
            {/* Препараты группы, если есть */}
            <div className="flex flex-row">
              {/* Блок для кнопки добавления подгруппы */}
              <div className={`w-1/3 pr-4 flex flex-col ${isEditorMode ? '' : 'invisible'}`}>
                {isEditorMode && (
                  <button
                    onClick={() => onOpenEditor('subgroup', group.id)}
                    className="px-3 py-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-all duration-200 flex items-center text-sm shadow-sm mb-4 self-end"
                  >
                    <Plus size={14} className="mr-1.5" />
                    <span className="font-medium">Добавить подгруппу</span>
                  </button>
                )}
              </div>

              {/* Блок для препаратов группы */}
              <div className="w-2/3">
                {group.preparations ? (
                  <div>
                    <div 
                      className="text-sm text-gray-700 formatted-preparations prep-container bg-gray-50 p-3 rounded-md"
                      dangerouslySetInnerHTML={{ __html: group.preparations }}
                    />
                    {isEditorMode && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => onOpenEditor('group', group.id)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all duration-200 flex items-center text-xs shadow-sm"
                        >
                          <Edit size={12} className="mr-1" />
                          <span className="font-medium">Редактировать</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : isEditorMode && (
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <div className="text-sm text-gray-500">Нет данных о препаратах</div>
                    <button
                      onClick={() => onOpenEditor('group', group.id)}
                      className="px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all duration-200 flex items-center text-xs shadow-sm"
                    >
                      <Plus size={12} className="mr-1.5" />
                      <span className="font-medium">Добавить препараты</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Подгруппы */}
            {group.subgroups && group.subgroups.length > 0 ? (
              group.subgroups.map((subgroup) => (
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
                  onDeleteItem={onDeleteItem}
                  onOpenEditor={onOpenEditor}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-lg">
                {isEditorMode ? (
                  <p>Добавьте подгруппу с помощью кнопки выше</p>
                ) : (
                  <p>В данной группе нет подгрупп</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupComponent; 