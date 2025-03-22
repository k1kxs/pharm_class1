import React, { useRef, useEffect, useState } from 'react';
import { Search, Download, Lock, Save, X, Plus, Clock, FileText } from 'lucide-react';

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
    cycles, 
    selectedCycles,
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
    isEditingTitle,
    editingTitleValue,
    searchQuery,
    draggedCycle,
    dragOverCycle,
    itemType,
    
    // Методы
    toggleCycle,
    openPasswordModal,
    closePasswordModal,
    handlePasswordSubmit: handlePasswordSubmitOriginal,
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
    setIsEditorMode,
    setPasswordModalOpen,
    setPasswordError,
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
  
  // Создаем адаптер для обработки ввода пароля
  const handlePasswordSubmit = (password: string) => {
    console.log('handlePasswordSubmit вызван с паролем:', password);
    handlePasswordSubmitOriginal(password);
  };
  
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
        currentGradient={cycles.find(c => c.id === selectedCycleId)?.gradient || 
          cycles.flatMap(c => c.groups).find(g => g.id === selectedCycleId)?.gradient}
        title={itemType === 'cycle' ? 'Выбор цвета цикла' : 'Выбор цвета группы'}
      />
      
      {/* Заголовок с режимом редактирования */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex-1 mb-2 sm:mb-0">
              <div className="text-sm text-gray-500 font-medium">ФГБОУ ВО ОрГМУ Минздрава России</div>
              <div className="text-xs text-gray-400">Кафедра фармакологии</div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {isEditorMode ? (
                <>
                  {/* Индикатор состояния сессии */}
                  <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                    <Clock size={14} className="mr-1.5 text-gray-500" />
                    <span>Сессия: {formatSessionTime(sessionTimeLeft)}</span>
                  </div>
                  
                  <button
                    onClick={exitEditorMode}
                    className="btn btn-sm bg-gray-100 text-gray-800 hover:bg-gray-200 transition-all duration-200 rounded-full shadow-sm flex items-center px-3 py-1.5"
                  >
                    <X size={14} className="mr-1.5" />
                    Выход
                  </button>
                </>
              ) : (
                <button
                  onClick={openPasswordModal}
                  className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-all duration-200 flex items-center shadow-sm"
                  title="Войти в режим редактирования"
                >
                  <Lock size={16} />
                </button>
              )}
              
              <button
                onClick={openExportModal}
                className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-all duration-200 flex items-center shadow-sm"
              >
                <Download size={14} className="mr-1.5" />
                <span className="hidden sm:inline text-sm font-medium">Экспорт</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Заголовок и поиск */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white transition-colors duration-300">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight text-center">
            Классификация лекарственных средств
          </h1>
          
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Поиск по препаратам, группам и категориям..."
                className="block w-full pl-12 pr-12 py-3.5 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow duration-200 font-medium shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
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
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => openEditModal('cycle')}
              className="px-4 py-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all duration-200 flex items-center shadow-sm"
            >
              <Plus size={18} className="mr-2" />
              <span className="font-medium">Добавить цикл</span>
            </button>
          </div>
        )}
        
        <div className="space-y-8">
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
            <div className="text-center text-gray-500 p-8 bg-white rounded-lg shadow-md">
              {searchQuery ? (
                <div className="py-8">
                  <div className="text-lg font-medium mb-3">Ничего не найдено</div>
                  <p>
                    По запросу "{searchQuery}" ничего не найдено. Попробуйте изменить запрос или очистить поиск.
                  </p>
                </div>
              ) : (
                <div className="py-8">
                  <div className="text-lg font-medium mb-3">Нет данных</div>
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