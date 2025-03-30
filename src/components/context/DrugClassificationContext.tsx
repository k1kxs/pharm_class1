import React, { createContext, useContext } from 'react';
import { Cycle, Group, Subgroup, Category, DraggedGroup, DraggedSubgroup, DraggedCategory, Table } from '../types';
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';

// Тип состояния
export interface DrugClassificationState {
  // Основные данные
  cycles: Cycle[];
  selectedCycles: number[];
  // Данные таблиц
  tables: Table[];
  
  // Состояния для модальных окон
  passwordModalOpen: boolean;
  passwordError: string | null;
  isEditorMode: boolean;
  isAuthenticated: boolean;
  editModalOpen: boolean;
  editType: 'cycle' | 'group' | 'subgroup' | 'category' | 'table';
  editTitle: string;
  editData: any | null;
  parentForEdit: number | null;
  exportModalOpen: boolean;
  colorPickerOpen: boolean;
  selectedCycleId: number | null;
  itemType: 'cycle' | 'group' | 'table';
  
  // Состояния для таблиц
  tableModalOpen: boolean;
  newTableName: string;
  newTableGradient: string;
  newTableRows: number;
  newTableColumns: number;
  selectedTableId: number | null;
  
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
  
  // Состояние загрузки данных
  isLoading: boolean;
  isInitialDataLoaded: boolean;
  isSaving: boolean;
}

// Тип действий контекста
export interface DrugClassificationActions {
  // Основные действия с данными
  setCycles: (cycles: Cycle[]) => void;
  toggleCycle: (cycleId: number) => void;
  setSelectedCycles: (cycles: number[]) => void;
  
  // Действия для таблиц
  setTables: (tables: Table[]) => void;
  openTableModal: () => void;
  closeTableModal: () => void;
  setNewTableName: (name: string) => void;
  setNewTableGradient: (gradient: string) => void;
  setNewTableSize: (rows: number, columns: number) => void;
  createTable: () => void;
  updateTableCell: (tableId: number, rowIndex: number, cellIndex: number, content: string) => void;
  addTableRow: (tableId: number) => void;
  addTableColumn: (tableId: number) => void;
  removeTableRow: (tableId: number, rowIndex: number) => void;
  removeTableColumn: (tableId: number, columnIndex: number) => void;
  editTableName: (tableId: number, name: string) => void;
  editTableGradient: (tableId: number, gradient: string) => void;
  deleteTable: (tableId: number) => void;
  
  // Действия для модальных окон
  openPasswordModal: () => void;
  closePasswordModal: () => void;
  handlePasswordSubmit: (password: string) => Promise<void>;
  exitEditorMode: () => void;
  setIsEditorMode: (value: boolean) => void;
  setPasswordModalOpen: (value: boolean) => void;
  setPasswordError: (error: string | null) => void;
  
  openEditModal: (type: 'cycle' | 'group' | 'subgroup' | 'category' | 'table', parentId?: number) => void;
  closeEditModal: () => void;
  handleSaveEdit: (data: any) => void;
  
  openExportModal: () => void;
  closeExportModal: () => void;
  handleExport: (cycleIds: number[]) => void;
  
  openColorPicker: (itemId: number, itemType?: 'cycle' | 'group' | 'table') => void;
  closeColorPicker: () => void;
  handleColorSelect: (gradient: string) => void;
  
  // Действия для редактирования заголовков
  startEditingTitle: (type: string, item: any) => void;
  finishEditingTitle: (type: string, id: number) => void;
  onEditingTitleChange: (value: string) => void;
  
  // Действия для поиска
  setSearchQuery: (query: string) => void;
  
  // Действия для удаления элементов
  handleDelete: (type: string, id: number) => void;
  
  // Действие для удаления препаратов
  handleDeleteMedications: (type: string, id: number) => void;
  
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
  
  // Новые действия для @dnd-kit
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  sensors: any; // Тип для сенсоров dnd-kit
  
  // Метод для принудительного обновления данных
  reloadData: () => Promise<void>;
  
  // Служебные функции
  checkSessionBeforeAction: (action: () => void) => void;
  
  // Функции для работы с таблицами внутри групп
  updateGroupTableCell: (groupId: number, tableId: number, rowIndex: number, cellIndex: number, content: string) => void;
  removeGroupTable: (groupId: number, tableId: number) => void;
  moveTableInGroup: (groupId: number, sourceIndex: number, targetIndex: number) => void;
  addTableRowInGroup: (groupId: number, tableId: number) => void;
  addTableColumnInGroup: (groupId: number, tableId: number) => void;
  removeTableRowInGroup: (groupId: number, tableId: number, rowIndex: number) => void;
  removeTableColumnInGroup: (groupId: number, tableId: number, columnIndex: number) => void;
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