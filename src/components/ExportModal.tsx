import React, { useState } from 'react';
import Modal from './ui/Modal';
import { FileText, Download } from 'lucide-react';
import { Cycle } from './types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycles: Cycle[];
  onExport: (cycleIds: number[]) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  cycles,
  onExport
}) => {
  const [selectedCycleIds, setSelectedCycleIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleToggleAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    if (newSelectAll) {
      setSelectedCycleIds(cycles.map(cycle => cycle.id));
    } else {
      setSelectedCycleIds([]);
    }
  };

  const handleToggleCycle = (cycleId: number) => {
    setSelectedCycleIds(prev => {
      if (prev.includes(cycleId)) {
        const newSelection = prev.filter(id => id !== cycleId);
        setSelectAll(newSelection.length === cycles.length);
        return newSelection;
      } else {
        const newSelection = [...prev, cycleId];
        setSelectAll(newSelection.length === cycles.length);
        return newSelection;
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExport(selectedCycleIds);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Экспорт в PDF">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
            <FileText size={28} className="text-purple-600" />
          </div>
        </div>
        
        <p className="text-center text-gray-700 mb-4">
          Выберите циклы для экспорта в PDF
        </p>
        
        <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-2">
          <div className="flex items-center p-2 border-b">
            <input
              type="checkbox"
              id="select-all"
              checked={selectAll}
              onChange={handleToggleAll}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="select-all" className="ml-2 block text-sm text-gray-700 font-medium">
              Выбрать все
            </label>
          </div>
          
          {cycles.map((cycle) => (
            <div key={cycle.id} className="flex items-center p-2 hover:bg-gray-50">
              <input
                type="checkbox"
                id={`cycle-${cycle.id}`}
                checked={selectedCycleIds.includes(cycle.id)}
                onChange={() => handleToggleCycle(cycle.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`cycle-${cycle.id}`} className="ml-2 block text-sm text-gray-700">
                {cycle.name}
              </label>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={selectedCycleIds.length === 0}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md flex items-center ${
              selectedCycleIds.length === 0 ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            <Download size={16} className="mr-1" />
            Экспортировать
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ExportModal; 