import React from 'react';
import { Edit, Trash, ArrowRight } from 'lucide-react';
import { Category } from './types';

interface CategoryComponentProps {
  category: Category;
  subgroupId: number;
  groupId: number;
  cycleId: number;
  isEditorMode: boolean;
  isEditingTitle: number | null;
  editingTitleValue: string;
  onStartEditingTitle: (type: string, item: any) => void;
  onFinishEditingTitle: (type: string, id: number) => void;
  onEditingTitleChange: (value: string) => void;
  onDeleteItem: (type: string, id: number) => void;
  onOpenEditor?: (type: string, parentId?: number) => void;
}

const CategoryComponent: React.FC<CategoryComponentProps> = ({
  category,
  subgroupId,
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
  return (
    <div className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="w-2/5 pr-4 min-w-0 overflow-hidden">
          {isEditingTitle === category.id ? (
            <div className="flex items-center">
              <input
                type="text"
                value={editingTitleValue}
                onChange={(e) => onEditingTitleChange(e.target.value)}
                className="border rounded-md px-3 py-1.5 mr-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none shadow-sm"
                autoFocus
              />
              <button
                onClick={() => onFinishEditingTitle('category', category.id)}
                className="p-1.5 bg-indigo-100 rounded-md text-indigo-700 hover:bg-indigo-200 transition-all duration-200 flex-shrink-0"
              >
                <Edit size={16} />
              </button>
            </div>
          ) : (
            <h5 className="text-base font-semibold flex items-center text-gray-800 group">
              <ArrowRight size={15} className="mr-1.5 text-indigo-500 flex-shrink-0" />
              <span className="break-words break-all whitespace-normal w-full">{category.name}</span>
              {isEditorMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEditingTitle('category', category);
                  }}
                  className="ml-2 p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  <Edit size={10} className="text-gray-600" />
                </button>
              )}
            </h5>
          )}
        </div>
        
        <div className="w-3/5">
          {category.preparations ? (
            <div>
              <div
                className="text-sm text-gray-700 formatted-preparations prep-container"
                dangerouslySetInnerHTML={{ __html: category.preparations }}
              />
              
              {isEditorMode && onOpenEditor && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => onOpenEditor('category', category.id)}
                    className="px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all duration-200 flex items-center text-xs shadow-sm"
                  >
                    <Edit size={10} className="mr-1.5" />
                    <span className="font-medium">Редактировать</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            isEditorMode && onOpenEditor && (
              <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 p-3 rounded-md border border-dashed border-gray-200">
                <span>Нет данных о препаратах</span>
                <button
                  onClick={() => onOpenEditor('category', category.id)}
                  className="px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all duration-200 flex items-center text-xs shadow-sm ml-3"
                >
                  <Edit size={10} className="mr-1.5" />
                  <span className="font-medium">Добавить</span>
                </button>
              </div>
            )
          )}
        </div>
        
        {isEditorMode && (
          <button
            onClick={() => onDeleteItem('category', category.id)}
            className="p-1.5 bg-gray-100 rounded-md hover:bg-red-100 hover:text-red-600 transition-all duration-200 flex-shrink-0 ml-2"
            title="Удалить категорию"
          >
            <Trash size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryComponent;