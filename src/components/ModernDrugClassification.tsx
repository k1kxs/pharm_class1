import React, { useRef, useEffect, useState } from 'react';
import { Search, Download, Lock, Save, X, Plus, Clock, FileText, Table as TableIcon } from 'lucide-react';

// Импортируем хук для использования контекста
import { useDrugClassification } from './context/DrugClassificationContext';
import useAuthSession from './hooks/useAuthSession';

// Импортируем компоненты
import CycleComponent from './CycleComponent';
import PasswordModal from './PasswordModal';
import EditModal from './EditModal';
import ExportModal from './ExportModal';
import ColorPickerModal from './ColorPickerModal';
import TableModal from './TableModal';
import TableComponent from './TableComponent';

// Импортируем компоненты для drag-and-drop
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const ModernDrugClassification: React.FC = () => {
  // Используем наш новый хук для доступа к глобальному состоянию и действиям
  const { 
    cycles, 
    selectedCycles,
    tables,
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
    tableModalOpen,
    selectedCycleId,
    selectedTableId,
    isEditingTitle,
    editingTitleValue,
    searchQuery,
    draggedCycle,
    dragOverCycle,
    itemType,
    isLoading,
    isInitialDataLoaded,
    isSaving,
    
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
    onEditingTitleChange: setEditingTitleValue,
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
    // Новые методы для dnd-kit
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    sensors,
    setIsEditorMode,
    setPasswordModalOpen,
    setPasswordError,
    reloadData,
    // Методы для таблиц
    openTableModal,
    closeTableModal,
    updateTableCell,
    deleteTable,
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
        currentGradient={
          itemType === 'table' 
            ? tables.find(t => t.id === selectedTableId)?.gradient 
            : cycles.find(c => c.id === selectedCycleId)?.gradient || 
              cycles.flatMap(c => c.groups).find(g => g.id === selectedCycleId)?.gradient
        }
        title={
          itemType === 'table' 
            ? 'Выбор цвета шапки таблицы' 
            : itemType === 'cycle' 
              ? 'Выбор цвета цикла' 
              : 'Выбор цвета группы'
        }
      />
      
      <TableModal
        isOpen={tableModalOpen}
        onClose={closeTableModal}
      />
      
      {/* Заголовок с режимом редактирования */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex-1 mb-2 sm:mb-0 flex items-center">
              <img src="/logo.png" alt="ОрГМУ" className="h-12 w-auto mr-4" />
              <div>
                <div className="text-sm text-gray-500 font-medium">ФГБОУ ВО ОрГМУ Минздрава России</div>
                <div className="text-xs text-gray-400">Кафедра фармакологии</div>
              </div>
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
              
              <div className="export-button-wrapper" onClick={openExportModal}>
                <button className="export-button" title="Экспорт в PDF">
                  <Download size={16} className="download-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Заголовок и поиск */}
      <div className="bg-header-wave relative overflow-hidden text-white py-12" style={{
        position: 'relative',
        boxShadow: '0px 8px 28px -9px rgba(0,0,0,0.45)',
        overflow: 'hidden'
      }}>
        {/* Анимированные волны */}
        <div className="wave" style={{
          position: 'absolute',
          width: '1000px',
          height: '1000px',
          opacity: 0.8,
          left: '-20%',
          top: '-50%',
          background: 'linear-gradient(744deg, #af40ff, #5b42f3 60%, #00ddeb)',
          borderRadius: '43%',
          animation: 'wave 55s infinite linear',
          zIndex: 0
        }}></div>
        <div className="wave" style={{
          position: 'absolute',
          width: '1200px',
          height: '1200px',
          opacity: 0.7,
          right: '-20%',
          top: '-70%',
          background: 'linear-gradient(744deg, #af40ff, #5b42f3 60%, #00ddeb)',
          borderRadius: '47%',
          animation: 'wave 50s infinite linear',
          zIndex: 0
        }}></div>
        <div className="wave" style={{
          position: 'absolute',
          width: '1100px',
          height: '1100px',
          opacity: 0.6,
          left: '10%',
          top: '-60%',
          background: 'linear-gradient(744deg, #af40ff, #5b42f3 60%, #00ddeb)',
          borderRadius: '45%',
          animation: 'wave 45s infinite linear',
          zIndex: 0
        }}></div>
        
        <div className="container mx-auto px-4 py-6 relative" style={{ zIndex: 1 }}>
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
                disabled={isLoading}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  disabled={isLoading}
                >
                  <X size={18} className="text-gray-500 hover:text-gray-700" />
                </button>
              )}
            </div>
            
            {isSaving && (
              <div className="mt-2 text-center text-white text-sm bg-blue-500 bg-opacity-50 py-1 px-3 rounded-full inline-block mx-auto">
                Сохранение изменений...
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Определяем анимацию в глобальных стилях */}
      <style>
        {`
          @keyframes wave {
            0% {
              transform: rotate(0deg);
            }
            
            100% {
              transform: rotate(360deg);
            }
          }
          
          .bg-header-wave {
            background-color: #5b42f3;
          }
        `}
      </style>
      
      {/* Основное содержимое */}
      <main className="container mx-auto px-4 py-8" ref={pdfRef}>
        {isEditorMode && (
          <div className="mb-6 flex justify-between">
            <button
              onClick={reloadData}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200 flex items-center shadow-sm"
              disabled={isLoading}
            >
              <Clock size={18} className="mr-2" />
              <span className="font-medium">Обновить данные</span>
            </button>
            
            <button
              onClick={() => openEditModal('cycle')}
              className="px-4 py-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all duration-200 flex items-center shadow-sm"
              disabled={isLoading}
            >
              <Plus size={18} className="mr-2" />
              <span className="font-medium">Добавить цикл</span>
            </button>
          </div>
        )}
        
        {/* Индикатор загрузки */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Загрузка данных о препаратах...</p>
          </div>
        )}
        
        {/* Нет результатов поиска */}
        {!isLoading && searchQuery.trim() !== '' && cycles.length === 0 && tables.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Ничего не найдено</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              По запросу "{searchQuery}" не найдено ни одного препарата, группы или таблицы. Попробуйте изменить запрос.
            </p>
          </div>
        )}
        
        {/* Отображение таблиц */}
        {!isLoading && tables.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Таблицы</h2>
            <div className="space-y-5">
              {tables.map((table) => (
                <TableComponent
                  key={table.id}
                  table={table}
                  isEditorMode={isEditorMode}
                  onEdit={() => openEditModal('table', table.id)}
                  onDelete={() => handleDelete('table', table.id)}
                  onColorChange={() => openColorPicker(table.id, 'table')}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Список циклов */}
        {!isLoading && cycles.length > 0 && (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={cycles.map(c => c.id.toString())} strategy={verticalListSortingStrategy}>
              <div className="space-y-8">
                {cycles.map((cycle) => (
                  <CycleComponent
                    key={cycle.id}
                    cycle={cycle}
                    isExpanded={selectedCycles.includes(cycle.id)}
                    onToggle={() => toggleCycle(cycle.id)}
                    isEditorMode={isEditorMode}
                    onEdit={() => openEditModal('cycle', cycle.id)}
                    onDelete={() => handleDelete('cycle', cycle.id)}
                    onColorChange={() => openColorPicker(cycle.id, 'cycle')}
                    isEditingTitle={isEditingTitle === cycle.id}
                    editingTitleValue={editingTitleValue}
                    onStartEditingTitle={() => startEditingTitle('cycle', cycle)}
                    onFinishEditingTitle={() => finishEditingTitle('cycle', cycle.id)}
                    onEditingTitleChange={setEditingTitleValue}
                    searchQuery={searchQuery}
                    openEditModal={openEditModal}
                    handleDelete={handleDelete}
                    onColorPickerOpen={openColorPicker}
                    onTableAdd={openTableModal}
                    onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleCycleDragStart(e, cycle)}
                    onDragOver={(e: React.DragEvent<HTMLDivElement>) => handleCycleDragOver(e, cycle)}
                    onDrop={(e: React.DragEvent<HTMLDivElement>) => handleCycleDrop(e, cycle)}
                    onDragEnd={handleCycleDragEnd}
                    onGroupDragStart={handleGroupDragStart}
                    onGroupDragOver={handleGroupDragOver}
                    onGroupDrop={handleGroupDrop}
                    onGroupDragEnd={handleGroupDragEnd}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>
      
      {/* Подвал */}
      <footer className="bg-white border-t py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 text-sm">
            © 2023 Кафедра фармакологии ОрГМУ. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernDrugClassification; 