import { ColorMap } from '../types';

// Карта соответствия градиентов к цветам
export const gradientColors: ColorMap = {
  'from-blue-500 via-indigo-500 to-violet-600': '#4682b4',
  'from-emerald-500 via-teal-500 to-cyan-600': '#3cb371',
  'from-amber-500 via-orange-500 to-yellow-500': '#ff8c00',
  'from-rose-500 via-pink-500 to-fuchsia-500': '#ff1493',
  'from-red-500 via-rose-500 to-pink-500': '#dc143c',
  'from-purple-600 via-violet-600 to-indigo-600': '#800080',
  'from-sky-500 via-blue-500 to-indigo-500': '#00bfff',
  'from-green-500 via-emerald-500 to-teal-500': '#2e8b57',
  'from-yellow-500 via-amber-500 to-orange-500': '#ffd700',
  'from-pink-500 via-rose-500 to-red-500': '#ff69b4'
};

// Функция для получения более светлого цвета для заголовков таблиц
export const getLighterColor = (hexColor: string): string => {
  try {
    // Если это градиент, берем первый цвет
    if (hexColor.startsWith('from-')) {
      const parts = hexColor.split(' ');
      if (parts.length > 0) {
        const firstColor = parts[0].replace('from-', '');
        // Конвертируем названия tailwind цветов в hex
        const colorMap = new Map<string, string>([
          ['blue-500', '#3b82f6'],
          ['indigo-500', '#6366f1'],
          ['violet-600', '#7c3aed'],
          ['emerald-500', '#10b981'],
          ['teal-500', '#14b8a6'],
          ['cyan-600', '#0891b2'],
          ['amber-500', '#f59e0b'],
          ['orange-500', '#f97316'],
          ['yellow-500', '#eab308'],
          ['red-500', '#ef4444'],
          ['pink-500', '#ec4899'],
          ['purple-500', '#a855f7'],
          ['gray-500', '#6b7280'],
        ]);
        return colorMap.get(firstColor) || '#4682b4';
      }
    }
    
    // Если это hex цвет
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Делаем цвет светлее на 20%
    const lighterR = Math.min(255, Math.floor(r + (255 - r) * 0.3));
    const lighterG = Math.min(255, Math.floor(g + (255 - g) * 0.3));
    const lighterB = Math.min(255, Math.floor(b + (255 - b) * 0.3));
    
    return `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
  } catch (error) {
    return '#8eb3d8'; // Светло-синий цвет по умолчанию
  }
};

// Функция для получения еще более светлого цвета для фона
export const getVeryLightColor = (hexColor: string): string => {
  try {
    if (hexColor.startsWith('from-')) {
      const parts = hexColor.split(' ');
      if (parts.length > 0) {
        const firstColor = parts[0].replace('from-', '');
        // Конвертируем названия tailwind цветов в hex и делаем очень светлыми
        const colorMap = new Map<string, string>([
          ['blue-500', '#e6f0ff'],
          ['indigo-500', '#eef2ff'],
          ['violet-600', '#f5f3ff'],
          ['emerald-500', '#ecfdf5'],
          ['teal-500', '#f0fdfa'],
          ['cyan-600', '#ecfeff'],
          ['amber-500', '#fffbeb'],
          ['orange-500', '#fff7ed'],
          ['yellow-500', '#fefce8'],
          ['red-500', '#fef2f2'],
          ['pink-500', '#fdf2f8'],
          ['purple-500', '#faf5ff'],
          ['gray-500', '#ececee'],
        ]);
        return colorMap.get(firstColor) || '#f0f5fa';
      }
    }
    
    // Если это hex цвет
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Делаем цвет очень светлым, почти белым с легким оттенком
    const lighterR = Math.min(255, Math.floor(r + (255 - r) * 0.85));
    const lighterG = Math.min(255, Math.floor(g + (255 - g) * 0.85));
    const lighterB = Math.min(255, Math.floor(b + (255 - b) * 0.85));
    
    return `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
  } catch (error) {
    return '#f0f5fa'; // Очень светло-синий цвет по умолчанию
  }
}; 