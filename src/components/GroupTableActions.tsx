import React from 'react';
import { Plus, TableIcon } from 'lucide-react';

interface GroupTableActionsProps {
  cycleId: number;
  onGroupAdd: (cycleId: number) => void;
  onTableAdd: () => void;
}

const GroupTableActions: React.FC<GroupTableActionsProps> = ({
  cycleId,
  onGroupAdd,
  onTableAdd
}) => {
  return (
    <div className="mb-4 flex gap-3">
      <button
        onClick={() => onGroupAdd(cycleId)}
        className="px-3 py-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-all duration-200 flex items-center text-sm shadow-sm"
      >
        <Plus size={14} className="mr-1.5" />
        <span className="font-medium">Добавить группу</span>
      </button>
      
      <button
        onClick={onTableAdd}
        className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-all duration-200 flex items-center text-sm shadow-sm"
      >
        <TableIcon size={14} className="mr-1.5" />
        <span className="font-medium">Добавить таблицу</span>
      </button>
    </div>
  );
};

export default GroupTableActions; 