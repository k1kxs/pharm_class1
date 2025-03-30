import React, { useState } from 'react';
import Modal from './ui/Modal';
import { FileText, Download, X, CheckCircle, Circle, CheckSquare, Square } from 'lucide-react';
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
        <div className="flex items-center justify-center">
          <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-100 text-indigo-600 rounded-full shadow-sm">
            <FileText size={28} />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-gray-800 font-medium text-lg">Создание классификации лекарств в PDF</h3>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            Выберите циклы для экспорта в профессиональный документ
          </p>
        </div>
        
        <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div 
            className="flex items-center p-3 bg-gray-50 border-b border-gray-200 sticky top-0 z-10 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
            onClick={handleToggleAll}
          >
            <div className="flex items-center justify-center h-5 w-5 text-indigo-600">
              {selectAll ? (
                <CheckSquare size={18} className="fill-indigo-100" />
              ) : (
                <Square size={18} className="text-gray-400" />
              )}
            </div>
            <label 
              htmlFor="select-all" 
              className="ml-3 block text-sm font-medium text-gray-800 cursor-pointer select-none"
            >
              Выбрать все циклы
            </label>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {cycles.map((cycle) => (
              <div 
                key={cycle.id} 
                className={`flex items-center p-3 border-b border-gray-100 cursor-pointer transition-colors duration-200 ${
                  selectedCycleIds.includes(cycle.id) 
                    ? 'bg-indigo-50 hover:bg-indigo-100' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleToggleCycle(cycle.id)}
              >
                <div className="flex items-center justify-center h-5 w-5 text-indigo-600">
                  {selectedCycleIds.includes(cycle.id) ? (
                    <CheckSquare size={18} className="fill-indigo-100" />
                  ) : (
                    <Square size={18} className="text-gray-400" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor={`cycle-${cycle.id}`} 
                      className="block text-sm font-medium text-gray-700 cursor-pointer select-none"
                    >
                      {cycle.name}
                    </label>
                    <span className="text-xs text-gray-500">{cycle.groups.length} групп</span>
                  </div>
                  <div className="mt-1 h-1.5 w-20 rounded-full" 
                       style={{ background: cycle.gradient || '#5b42f3' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 text-sm">
          <h4 className="font-medium text-gray-700 mb-2">Возможности экспорта</h4>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>Чистый и минималистичный дизайн медицинского документа</span>
            </li>
            <li className="flex items-start">
              <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>Сохранение всех цветов и градиентов из веб-интерфейса</span>
            </li>
            <li className="flex items-start">
              <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>Корректное форматирование таблиц и маркированных списков</span>
            </li>
            <li className="flex items-start">
              <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>Оптимизация для печати и использования (формат A4)</span>
            </li>
          </ul>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 shadow-sm flex items-center"
          >
            <X size={16} className="mr-1.5" />
            Отмена
          </button>
          <button
            type="submit"
            disabled={selectedCycleIds.length === 0}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm flex items-center ${
              selectedCycleIds.length === 0 
              ? 'bg-indigo-300 cursor-not-allowed opacity-70' 
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200'
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