import React from 'react';
import { ChevronDown, ChevronRight, Edit, Trash, Plus } from 'lucide-react';
import { Subgroup, Category } from './types';
import CategoryComponent from './CategoryComponent';

interface SubgroupComponentProps {
  subgroup: Subgroup;
  groupId: number;
  cycleId: number;
  isEditorMode: boolean;
  isEditingTitle: number | null;
  editingTitleValue: string;
  onStartEditingTitle: (type: string, item: any) => void;
  onFinishEditingTitle: (type: string, id: number) => void;
  onEditingTitleChange: (value: string) => void;
  onDeleteItem: (type: string, id: number) => void;
  onOpenEditor: (type: string, parentId?: number) => void;
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
  onOpenEditor
}) => {
  const [isSubgroupExpanded, setIsSubgroupExpanded] = React.useState(false);

  return (
    <div className="border border-gray-100 rounded bg-white">
      <div className="p-2 flex justify-between items-center hover:bg-gray-50">
        <div className="flex-1">
          {isEditingTitle === subgroup.id ? (
            <div className="flex items-center">
              <input
                type="text"
                value={editingTitleValue}
                onChange={(e) => onEditingTitleChange(e.target.value)}
                className="border rounded px-2 py-1 mr-2 w-full"
                autoFocus
              />
              <button
                onClick={() => onFinishEditingTitle('subgroup', subgroup.id)}
                className="p-1 bg-blue-100 rounded text-blue-800"
              >
                <Edit size={16} />
              </button>
            </div>
          ) : (
            <h4 
              className="text-md font-medium flex items-center cursor-pointer"
              onClick={() => setIsSubgroupExpanded(!isSubgroupExpanded)}
            >
              {isSubgroupExpanded ? <ChevronDown size={16} className="mr-1" /> : <ChevronRight size={16} className="mr-1" />}
              {subgroup.name}
              {isEditorMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEditingTitle('subgroup', subgroup);
                  }}
                  className="ml-2 p-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <Edit size={12} />
                </button>
              )}
            </h4>
          )}
        </div>
        {isEditorMode && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDeleteItem('subgroup', subgroup.id)}
              className="p-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors duration-200"
              title="Удалить подгруппу"
            >
              <Trash size={14} />
            </button>
          </div>
        )}
      </div>
      
      {isSubgroupExpanded && (
        <div className="p-2 pl-4 bg-gray-50">
          {isEditorMode && (
            <div className="mb-3 flex justify-end">
              <button
                onClick={() => onOpenEditor('category', subgroup.id)}
                className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors duration-200 flex items-center text-xs"
              >
                <Plus size={12} className="mr-1" />
                Добавить категорию
              </button>
            </div>
          )}
          
          <div className="space-y-3">
            {subgroup.categories.length > 0 ? (
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
                />
              ))
            ) : (
              <div className="text-center text-gray-500 p-1 text-sm">
                Нет категорий в этой подгруппе. {isEditorMode && "Добавьте новую категорию с помощью кнопки выше."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubgroupComponent; 