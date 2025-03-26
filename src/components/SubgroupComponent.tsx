import React from 'react';
import { ChevronDown, ChevronRight, Edit, Trash, Plus, CornerDownRight, ArrowRight } from 'lucide-react';
import { Subgroup, Category } from './types';
import CategoryComponent from './CategoryComponent';

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
  onOpenEditor: (type: 'cycle' | 'group' | 'subgroup' | 'category', parentId?: number) => void;
  searchQuery?: string;
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
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm transition-all duration-200 hover:shadow subgroup-component mb-4 last:mb-0">
      <div className="p-3 flex justify-between items-center rounded-lg hover:bg-gray-50 transition-colors duration-200">
        <div className="flex-1 flex items-center min-w-0 overflow-hidden mr-2">
          <CornerDownRight size={16} className="text-gray-400 mr-2 flex-shrink-0" />
          
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
              className="group flex items-center cursor-pointer flex-1 min-w-0 overflow-hidden"
              onClick={() => setIsSubgroupExpanded(!isSubgroupExpanded)}
            >
              <div className="flex items-center transition-transform duration-200 flex-shrink-0">
                {isSubgroupExpanded ? 
                  <ChevronDown size={18} className="mr-2 text-indigo-500" /> : 
                  <ChevronRight size={18} className="mr-2 text-indigo-500 transition-transform duration-200 group-hover:translate-x-1" />
                }
              </div>
              
              <h4 className="text-base font-medium flex items-center text-gray-700 min-w-0 max-w-full">
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
          <div className="flex flex-row md:flex-row flex-col">
            <div className="w-full md:w-11/12 mx-auto pr-0 md:pr-4">
              {subgroup.preparations ? (
                <div>
                  <div 
                    className="text-sm text-gray-700 formatted-preparations prep-container bg-gray-50 p-3 rounded-md"
                    dangerouslySetInnerHTML={{ 
                      __html: subgroup.preparations
                    }}
                  />
                  {isEditorMode && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => onOpenEditor('subgroup', subgroup.id)}
                        className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all duration-200 flex items-center text-xs shadow-sm"
                      >
                        <Edit size={12} className="mr-1" />
                        Редактировать список
                      </button>
                    </div>
                  )}
                </div>
              ) : isEditorMode ? (
                <div className="text-center text-gray-500 p-3 bg-white rounded-lg text-sm border border-gray-100">
                  <p>Добавьте препараты</p>
                </div>
              ) : null}
              
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
                  />
                ))
              ) : (
                <div className="text-center text-gray-500 p-3 bg-white rounded-lg text-sm border border-gray-100">
                  {isEditorMode ? (
                    <p>Добавьте категорию с помощью кнопки справа</p>
                  ) : (
                    <p>В данной подгруппе нет категорий</p>
                  )}
                </div>
              )}
              
              {isEditorMode && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => onOpenEditor('category', subgroup.id)}
                    className="px-2.5 py-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-all duration-200 flex items-center text-xs shadow-sm"
                  >
                    <Plus size={12} className="mr-1.5" />
                    <span className="font-medium">Добавить категорию</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubgroupComponent;