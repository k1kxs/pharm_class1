import React from 'react';
import { Edit, Trash } from 'lucide-react';
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
  onDeleteItem
}) => {
  return (
    <div className="p-2 bg-white rounded border">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {isEditingTitle === category.id ? (
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={editingTitleValue}
                onChange={(e) => onEditingTitleChange(e.target.value)}
                className="border rounded px-2 py-1 mr-2 w-full"
                autoFocus
              />
              <button
                onClick={() => onFinishEditingTitle('category', category.id)}
                className="p-1 bg-blue-100 rounded text-blue-800"
              >
                <Edit size={16} />
              </button>
            </div>
          ) : (
            <h5 className="text-sm font-semibold mb-2 flex items-center">
              {category.name}
              {isEditorMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEditingTitle('category', category);
                  }}
                  className="ml-2 p-1 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <Edit size={10} />
                </button>
              )}
            </h5>
          )}
          
          {category.preparations && (
            <div 
              className="text-sm text-gray-600"
              dangerouslySetInnerHTML={{ __html: category.preparations }}
            />
          )}
        </div>
        
        {isEditorMode && (
          <button
            onClick={() => onDeleteItem('category', category.id)}
            className="p-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors duration-200 flex-shrink-0 mt-1"
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