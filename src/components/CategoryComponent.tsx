import React from 'react';
import { Edit, Trash, ArrowRight, Plus } from 'lucide-react';
import { Category } from './types';
import TableComponent from './TableComponent';

interface CategoryComponentProps {
  category: Category;
  subgroupId: number;
  groupId: number;
  cycleId: number;
  isEditorMode: boolean;
  isEditingTitle?: number | null;
  editingTitleValue?: string;
  onStartEditingTitle?: (type: string, item: any) => void;
  onFinishEditingTitle?: (type: string, id: number) => void;
  onEditingTitleChange?: (value: string) => void;
  onDeleteItem: (type: string, id: number) => void;
  onOpenEditor?: (type: 'cycle' | 'group' | 'subgroup' | 'category' | 'table', parentId?: number) => void;
  searchQuery?: string;
  handleDeleteMedications?: (type: string, id: number) => void;
  openTableModal?: (groupId?: number, categoryId?: number) => void;
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
  onOpenEditor,
  handleDeleteMedications,
  openTableModal
}) => {
  const [showEmptyMedicationsPlaceholder, setShowEmptyMedicationsPlaceholder] = React.useState(false);

  return (
    <div className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 category-component">
      <div className="flex justify-between items-start">
        <div className="w-1/3 pr-4 min-w-0 overflow-hidden">
          {isEditingTitle === category.id ? (
            <div className="flex items-center">
              <input
                type="text"
                value={editingTitleValue || ''}
                onChange={(e) => onEditingTitleChange && onEditingTitleChange(e.target.value)}
                className="border rounded-md px-3 py-1.5 mr-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none shadow-sm"
                autoFocus
              />
              <button
                onClick={() => onFinishEditingTitle && onFinishEditingTitle('category', category.id)}
                className="p-1.5 bg-indigo-100 rounded-md text-indigo-700 hover:bg-indigo-200 transition-all duration-200 flex-shrink-0"
              >
                <Edit size={16} />
              </button>
            </div>
          ) : (
            <h5 className="text-base font-semibold flex items-center text-gray-800 group pl-6">
              <ArrowRight size={15} className="mr-1.5 text-indigo-500 flex-shrink-0" />
              <span className="break-words break-all whitespace-normal w-full">{category.name}</span>
              {isEditorMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEditingTitle && onStartEditingTitle('category', category);
                  }}
                  className="ml-2 p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  <Edit size={10} className="text-gray-600" />
                </button>
              )}
            </h5>
          )}
          
          {isEditorMode && !category.preparations && (
            <div className="mt-2">
              <button
                onClick={() => setShowEmptyMedicationsPlaceholder(true)}
                className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-all duration-200 flex items-center text-xs shadow-sm mr-2"
              >
                <Plus size={12} className="mr-1" />
                Добавить препараты
              </button>
              <button
                onClick={() => openTableModal && openTableModal(groupId, category.id)}
                className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all duration-200 flex items-center text-xs shadow-sm mt-2"
              >
                <Plus size={12} className="mr-1" />
                Добавить таблицу
              </button>
            </div>
          )}
        </div>
        
        <div className="w-2-3">
          {/* Таблицы категории, если они есть */}
          {category.tables && category.tables.length > 0 && (
            <div className="mb-4">
              <div className="space-y-4">
                {category.tables.map((table) => (
                  <TableComponent
                    key={table.id}
                    table={table}
                    isEditorMode={isEditorMode}
                    hideHeader={true}
                    groupId={groupId}
                    categoryId={category.id}
                    onDelete={() => onDeleteItem('table', table.id)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {category.preparations ? (
            <div>
              <div 
                className="text-sm text-gray-700 formatted-preparations prep-container bg-gray-50 p-3 rounded-md"
                dangerouslySetInnerHTML={{ 
                  __html: category.preparations
                }}
              />
              {isEditorMode && onOpenEditor && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => onOpenEditor('category', category.id)}
                    className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all duration-200 flex items-center text-xs shadow-sm"
                  >
                    <Edit size={12} className="mr-1" />
                    Редактировать препараты
                  </button>
                </div>
              )}
            </div>
          ) : isEditorMode && showEmptyMedicationsPlaceholder ? (
            <div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md border border-dashed border-gray-300">
                <div className="text-sm text-gray-500">Нет данных о препаратах</div>
              </div>
              {onOpenEditor && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => onOpenEditor('category', category.id)}
                    className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-all duration-200 flex items-center text-xs shadow-sm"
                  >
                    <Edit size={12} className="mr-1" />
                    Редактировать препараты
                  </button>
                </div>
              )}
            </div>
          ) : null}
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