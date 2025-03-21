// Общие типы для компонентов классификации лекарственных средств

export interface Category {
  id: number;
  name: string;
  preparations: string;
}

export interface Subgroup {
  id: number;
  name: string;
  categories: Category[];
}

export interface Group {
  id: number;
  name: string;
  subgroups: Subgroup[];
  preparations?: string; // Опциональное поле для группы с препаратами
}

export interface Cycle {
  id: number;
  name: string;
  gradient: string;
  groups: Group[];
}

// Интерфейсы для перетаскивания элементов
export interface DraggedGroup extends Group {
  cycleId: number;
}

export interface DraggedSubgroup extends Subgroup {
  groupId: number;
  cycleId: number;
}

export interface DraggedCategory extends Category {
  subgroupId: number;
  groupId: number;
  cycleId: number;
}

export interface ParentTypeSelection {
  type: string;
  parentId: number | null | undefined;
}

// Типы для редактирования
export interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  type: 'cycle' | 'group' | 'subgroup' | 'category';
  title: string;
  initialData?: any;
  parentId?: number | null;
}

// Типы для PDF
export type TailwindColor = 'blue-500' | 'indigo-500' | 'violet-600' | string;

export interface ColorMap {
  [key: string]: string;
}

export type StrictColorMap = {
  [K in TailwindColor]: string;
};

// Типы для аутентификации 
export interface AuthenticationResult {
  success: boolean;
  message: string;
  token?: string;
  expiresAt?: number;
}

export interface UserSession {
  token: string;
  expiresAt: number;
}

export interface LoginAttempts {
  count: number;
  lastAttempt: number;
  lockedUntil: number | null;
} 