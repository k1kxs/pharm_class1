import React, { createContext, useContext } from 'react';
import { Cycle, Group, Subgroup, Category, DraggedGroup, DraggedSubgroup, DraggedCategory } from '../types';

// Тип состояния
export interface DrugClassificationState {
  // Основные данные
  cycles: Cycle[];
  selectedCycles: number[];
  
  // Состояния для модальных окон
  passwordModalOpen: boolean;
  passwordError: string | null;
  isEditorMode: boolean;
  editModalOpen: boolean;
  editType: 'cycle' | 'group' | 'subgroup' | 'category';
  editTitle: string;
  editData: any | null;
  parentForEdit: number | null;
  exportModalOpen: boolean;
  colorPickerOpen: boolean;
  selectedCycleId: number | null;
  
  // Состояния для редактирования заголовков
  isEditingTitle: number | null;
  editingTitleValue: string;
  
  // Состояния для поиска
  searchQuery: string;
  
  // Состояния для drag and drop
  draggedCycle: Cycle | null;
  dragOverCycle: Cycle | null;
  draggedGroup: DraggedGroup | null;
  dragOverGroup: DraggedGroup | null;
  draggedSubgroup: DraggedSubgroup | null;
  dragOverSubgroup: DraggedSubgroup | null;
  draggedCategory: DraggedCategory | null;
  
  // Состояние сессии
  sessionExpirationTime?: number;
}

// Тип действий контекста
export interface DrugClassificationActions {
  // Основные действия с данными
  setCycles: (cycles: Cycle[]) => void;
  toggleCycle: (cycleId: number) => void;
  
  // Действия для модальных окон
  openPasswordModal: () => void;
  closePasswordModal: () => void;
  handlePasswordSubmit: (password: string) => Promise<void>;
  exitEditorMode: () => void;
  setIsEditorMode: (value: boolean) => void;
  setPasswordModalOpen: (value: boolean) => void;
  setPasswordError: (error: string | null) => void;
  
  openEditModal: (type: 'cycle' | 'group' | 'subgroup' | 'category', parentId?: number) => void;
  closeEditModal: () => void;
  handleSaveEdit: (data: any) => void;
  
  openExportModal: () => void;
  closeExportModal: () => void;
  handleExport: (cycleIds: number[]) => void;
  
  openColorPicker: (cycleId: number) => void;
  closeColorPicker: () => void;
  handleColorSelect: (gradient: string) => void;
  
  // Действия для редактирования заголовков
  startEditingTitle: (type: string, item: any) => void;
  finishEditingTitle: (type: string, id: number) => void;
  setEditingTitleValue: (value: string) => void;
  
  // Действия для поиска
  setSearchQuery: (query: string) => void;
  
  // Действия для удаления элементов
  handleDelete: (type: string, id: number) => void;
  
  // Действия для drag and drop циклов
  handleCycleDragStart: (e: React.DragEvent, cycle: Cycle) => void;
  handleCycleDragOver: (e: React.DragEvent, cycle: Cycle) => void;
  handleCycleDrop: (e: React.DragEvent, cycle: Cycle) => void;
  handleCycleDragEnd: () => void;
  
  // Действия для drag and drop групп
  handleGroupDragStart: (e: React.DragEvent, group: Group, cycleId: number) => void;
  handleGroupDragOver: (e: React.DragEvent, group: Group, cycleId: number) => void;
  handleGroupDrop: (e: React.DragEvent, group: Group, cycleId: number) => void;
  handleGroupDragEnd: () => void;
}

// Создаем тип для полного контекста (состояние + действия)
export type DrugClassificationContextType = DrugClassificationState & DrugClassificationActions;

// Создаем контекст с начальным значением undefined
const DrugClassificationContext = createContext<DrugClassificationContextType | undefined>(undefined);

// Хук для использования контекста
export const useDrugClassification = (): DrugClassificationContextType => {
  const context = useContext(DrugClassificationContext);
  if (context === undefined) {
    throw new Error('useDrugClassification должен использоваться внутри DrugClassificationProvider');
  }
  return context;
};

export default DrugClassificationContext; 