import React, { useState } from 'react';
import Modal from './ui/Modal';
import { FileText, Download, X, CheckCircle, Circle } from 'lucide-react';
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
    <Modal isOpen={isOpen} onClose={onClose} title="Экспорт в PDF" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-full">
            <FileText size={32} />
          </div>
        </div>
        
        <p className="text-center text-gray-700 mb-4 max-w-md mx-auto">
          Выберите циклы, которые хотите экспортировать в PDF-документ
        </p>
        
        <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-1 shadow-sm">
          <div 
            className="flex items-center p-3 border-b border-gray-200 sticky top-0 bg-white z-10 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            onClick={handleToggleAll}
          >
            <div className="flex items-center justify-center h-5 w-5 text-purple-600">
              {selectAll ? (
                <CheckCircle size={20} className="fill-purple-100 text-purple-600" />
              ) : (
                <Circle size={20} className="text-gray-300" />
              )}
            </div>
            <label 
              htmlFor="select-all" 
              className="ml-3 block text-sm text-gray-800 font-medium cursor-pointer select-none"
            >
              Выбрать все циклы
            </label>
          </div>
          
          <div className="divide-y divide-gray-100">
            {cycles.map((cycle) => (
              <div 
                key={cycle.id} 
                className={`flex items-center p-3 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                  selectedCycleIds.includes(cycle.id) ? 'bg-purple-50' : ''
                }`}
                onClick={() => handleToggleCycle(cycle.id)}
              >
                <div className="flex items-center justify-center h-5 w-5 text-purple-600">
                  {selectedCycleIds.includes(cycle.id) ? (
                    <CheckCircle size={20} className="fill-purple-100 text-purple-600" />
                  ) : (
                    <Circle size={20} className="text-gray-300" />
                  )}
                </div>
                <label 
                  htmlFor={`cycle-${cycle.id}`} 
                  className="ml-3 block text-sm text-gray-700 cursor-pointer select-none"
                >
                  {cycle.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 shadow-sm flex items-center"
          >
            <X size={16} className="mr-1.5" />
            Отмена
          </button>
          <button
            type="submit"
            disabled={selectedCycleIds.length === 0}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm flex items-center ${
              selectedCycleIds.length === 0 
              ? 'bg-purple-300 cursor-not-allowed opacity-70' 
              : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200'
            }`}
          >
            <Download size={16} className="mr-1.5" />
            Экспортировать ({selectedCycleIds.length})
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ExportModal; 