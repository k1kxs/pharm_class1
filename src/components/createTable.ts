import { Table, TableRow, TableCell } from './types';

/**
 * Создает новую таблицу с указанными параметрами
 */
export const createTable = (
  name: string,
  gradient: string,
  rows: number,
  columns: number
): Table => {
  const tableRows: TableRow[] = [];
  const newId = Date.now();
  
  for (let r = 0; r < rows; r++) {
    const cells: TableCell[] = [];
    for (let c = 0; c < columns; c++) {
      cells.push({
        id: newId + r * 100 + c,
        content: ''
      });
    }
    tableRows.push({
      id: newId + r * 1000,
      cells
    });
  }
  
  return {
    id: newId,
    name: name,
    gradient: gradient,
    rows: tableRows,
    columns: columns
  };
};

/**
 * Преобразует пользовательский градиент в класс для Tailwind
 */
export const convertGradientToTailwind = (gradient: string): string => {
  // Если градиент уже в формате Tailwind, возвращаем его
  if (gradient.startsWith('from-')) {
    return gradient;
  }
  
  // По умолчанию возвращаем синий градиент
  return 'from-blue-500 via-indigo-500 to-violet-600';
}; 