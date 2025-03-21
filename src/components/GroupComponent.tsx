import React from 'react';
import { ChevronDown, ChevronRight, Edit, Trash, Plus } from 'lucide-react';
import { Group, Subgroup } from './types';
import SubgroupComponent from './SubgroupComponent';

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
  onGroupDragStart,
  onGroupDragOver,
  onGroupDrop,
  onGroupDragEnd
}) => {
  const [isGroupExpanded, setIsGroupExpanded] = React.useState(false);

  return (
    <div 
      className={`border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200`}
      draggable={isEditorMode}
      onDragStart={(e) => onGroupDragStart(e, group, cycleId)}
      onDragOver={(e) => onGroupDragOver(e, group, cycleId)}
      onDrop={(e) => onGroupDrop(e, group, cycleId)}
      onDragEnd={onGroupDragEnd}
    >
      <div className="p-3 bg-white rounded-t-lg border-b flex justify-between items-center">
        <div className="flex-1">
          {isEditingTitle === group.id ? (
            <div className="flex items-center">
              <input
                type="text"
                value={editingTitleValue}
                onChange={(e) => onEditingTitleChange(e.target.value)}
                className="border rounded px-2 py-1 mr-2 w-full"
                autoFocus
              />
              <button
                onClick={() => onFinishEditingTitle('group', group.id)}
                className="p-1 bg-blue-100 rounded text-blue-800"
              >
                <Edit size={16} />
              </button>
            </div>
          ) : (
            <h3 
              className="text-lg font-medium flex items-center cursor-pointer"
              onClick={() => setIsGroupExpanded(!isGroupExpanded)}
            >
              {isGroupExpanded ? <ChevronDown size={18} className="mr-2" /> : <ChevronRight size={18} className="mr-2" />}
              {group.name}
              {isEditorMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEditingTitle('group', group);
                  }}
                  className="ml-2 p-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <Edit size={14} />
                </button>
              )}
            </h3>
          )}
        </div>
        {isEditorMode && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDeleteItem('group', group.id)}
              className="p-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors duration-200"
              title="Удалить группу"
            >
              <Trash size={16} />
            </button>
          </div>
        )}
      </div>
      
      {isGroupExpanded && (
        <div className="p-3 bg-gray-50 rounded-b-lg">
          {/* Препараты группы, если есть */}
          {group.preparations && (
            <div className="mb-4 p-3 bg-white rounded border">
              <h4 className="text-sm font-semibold mb-2">Препараты:</h4>
              <div 
                className="text-sm text-gray-600"
                dangerouslySetInnerHTML={{ __html: group.preparations }}
              />
            </div>
          )}
          
          {isEditorMode && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => onOpenEditor('subgroup', group.id)}
                className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors duration-200 flex items-center text-sm"
              >
                <Plus size={14} className="mr-1" />
                Добавить подгруппу
              </button>
            </div>
          )}
          
          <div className="space-y-4">
            {group.subgroups.length > 0 ? (
              group.subgroups.map((subgroup: Subgroup) => (
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
              <div className="text-center text-gray-500 p-2">
                Нет подгрупп в этой группе. {isEditorMode && "Добавьте новую подгруппу с помощью кнопки выше."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupComponent; 