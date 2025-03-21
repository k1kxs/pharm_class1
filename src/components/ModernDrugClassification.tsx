import React, { useRef, useEffect, useState } from 'react';
import { Search, Download, Lock, Save, X, Plus, Clock } from 'lucide-react';

// Импортируем хук для использования контекста
import { useDrugClassification } from './context/DrugClassificationContext';
import useAuthSession from './hooks/useAuthSession';

// Импортируем компоненты
import CycleComponent from './CycleComponent';
import PasswordModal from './PasswordModal';
import EditModal from './EditModal';
import ExportModal from './ExportModal';
import ColorPickerModal from './ColorPickerModal';

const ModernDrugClassification: React.FC = () => {
  // Используем наш новый хук для доступа к глобальному состоянию и действиям
  const {
    // Данные
    cycles,
    selectedCycles,
    
    // Состояния для модальных окон
    passwordModalOpen,
    passwordError,
    isEditorMode,
    editModalOpen,
    editType,
    editTitle,
    editData,
    parentForEdit,
    exportModalOpen,
    colorPickerOpen,
    selectedCycleId,
    
    // Состояния для редактирования заголовков
    isEditingTitle,
    editingTitleValue,
    
    // Состояния для поиска
    searchQuery,
    
    // Состояния для drag and drop
    draggedCycle,
    dragOverCycle,
    
    // Действия
    toggleCycle,
    openPasswordModal,
    closePasswordModal,
    handlePasswordSubmit,
    exitEditorMode,
    openEditModal,
    closeEditModal,
    handleSaveEdit,
    openExportModal,
    closeExportModal,
    handleExport,
    openColorPicker,
    closeColorPicker,
    handleColorSelect,
    startEditingTitle,
    finishEditingTitle,
    setEditingTitleValue,
    setSearchQuery,
    handleDelete,
    handleCycleDragStart,
    handleCycleDragOver,
    handleCycleDrop,
    handleCycleDragEnd,
    handleGroupDragStart,
    handleGroupDragOver,
    handleGroupDrop,
    handleGroupDragEnd,
  } = useDrugClassification();
  
  // Реф для генерации PDF
  const pdfRef = useRef<HTMLDivElement>(null);
  
  // Используем хук для отслеживания состояния сессии
  const { isSessionActive } = useAuthSession();
  
  // Состояние для отображения времени сессии
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number>(24 * 60); // 24 часа в минутах
  
  // Обновление времени сессии каждую минуту
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isEditorMode) {
      // Устанавливаем интервал для обновления времени каждую минуту
      timer = setInterval(() => {
        setSessionTimeLeft(prev => Math.max(0, prev - 1));
      }, 60000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isEditorMode]);
  
  // Форматирование времени сессии
  const formatSessionTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
  };
  
  // Вычисляем, есть ли результаты для отображения
  const hasResults = cycles.length > 0;
  const hasSearchResults = searchQuery.trim() !== '' && cycles.length > 0;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Модальные окна */}
      <PasswordModal
        isOpen={passwordModalOpen}
        onClose={closePasswordModal}
        onPasswordSubmit={handlePasswordSubmit}
        error={passwordError}
      />
      
      <EditModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        onSave={handleSaveEdit}
        type={editType}
        title={editTitle}
        initialData={editData}
        parentId={parentForEdit}
      />
      
      <ExportModal
        isOpen={exportModalOpen}
        onClose={closeExportModal}
        cycles={cycles}
        onExport={handleExport}
      />
      
      <ColorPickerModal
        isOpen={colorPickerOpen}
        onClose={closeColorPicker}
        onColorSelect={handleColorSelect}
        currentGradient={cycles.find(c => c.id === selectedCycleId)?.gradient}
      />
      
      {/* Заголовок с режимом редактирования */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex-1 mb-2 sm:mb-0">
              <div className="text-sm text-gray-500">ФГБОУ ВО ОрГМУ Минздрава России</div>
              <div className="text-sm text-gray-500">Кафедра фармакологии</div>
            </div>
            
            <div className="flex flex-wrap items-center space-x-2 sm:space-x-4">
              {isEditorMode ? (
                <>
                  {/* Индикатор состояния сессии */}
                  <div className="flex items-center mr-3 text-sm text-gray-600">
                    <Clock size={16} className="mr-1" />
                    <span>Сессия: {formatSessionTime(sessionTimeLeft)}</span>
                  </div>
                  
                  <button
                    onClick={() => openEditModal('cycle')}
                    className="px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors duration-200 flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Добавить цикл
                  </button>
                  <button
                    onClick={exitEditorMode}
                    className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center"
                  >
                    <X size={16} className="mr-1" />
                    Выход
                  </button>
                </>
              ) : (
                <button
                  onClick={openPasswordModal}
                  className="p-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-opacity-80 transition-colors duration-200 flex items-center"
                  title="Войти в режим редактирования"
                >
                  <Lock size={18} />
                </button>
              )}
              
              <button
                onClick={openExportModal}
                className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors duration-200 flex items-center"
              >
                <Download size={16} className="mr-1" />
                <span className="hidden sm:inline">Экспорт</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Заголовок и поиск */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 tracking-tight text-center">Классификация лекарственных средств</h1>
          
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Поиск по препаратам, группам и категориям..."
                className="block w-full pl-10 pr-4 py-3 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow duration-200 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X size={18} className="text-gray-500 hover:text-gray-700" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Основное содержимое */}
      <main className="container mx-auto px-4 py-8" ref={pdfRef}>
        {isEditorMode && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => openEditModal('cycle')}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors duration-200 flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Добавить цикл
            </button>
          </div>
        )}
        
        <div className="space-y-6">
          {hasResults ? (
            cycles.map((cycle) => (
              <CycleComponent
                key={cycle.id}
                cycle={cycle}
                isSelected={selectedCycles.includes(cycle.id)}
                isEditorMode={isEditorMode}
                isEditingTitle={isEditingTitle}
                editingTitleValue={editingTitleValue}
                draggedCycle={draggedCycle}
                dragOverCycle={dragOverCycle}
                onToggleCycle={toggleCycle}
                onStartEditingTitle={startEditingTitle}
                onFinishEditingTitle={finishEditingTitle}
                onEditingTitleChange={setEditingTitleValue}
                onOpenColorPicker={openColorPicker}
                onDeleteItem={handleDelete}
                onOpenEditor={(type, parentId) => openEditModal(type as 'cycle' | 'group' | 'subgroup' | 'category', parentId)}
                onCycleDragStart={handleCycleDragStart}
                onCycleDragOver={handleCycleDragOver}
                onCycleDrop={handleCycleDrop}
                onCycleDragEnd={handleCycleDragEnd}
                onGroupDragStart={handleGroupDragStart}
                onGroupDragOver={handleGroupDragOver}
                onGroupDrop={handleGroupDrop}
                onGroupDragEnd={handleGroupDragEnd}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 p-8 bg-white rounded-lg shadow">
              {searchQuery ? (
                <div>
                  <div className="text-lg font-medium mb-2">Ничего не найдено</div>
                  <p>
                    По запросу "{searchQuery}" ничего не найдено. Попробуйте изменить запрос или очистить поиск.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-lg font-medium mb-2">Нет данных</div>
                  <p>
                    {isEditorMode ? 
                      "Добавьте новый цикл с помощью кнопки выше." : 
                      "В базе данных пока нет информации о лекарственных средствах."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Футер */}
      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4">
          <div className="text-sm text-gray-500 text-center">
            © ФГБОУ ВО ОрГМУ Минздрава России, кафедра фармакологии
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernDrugClassification; 