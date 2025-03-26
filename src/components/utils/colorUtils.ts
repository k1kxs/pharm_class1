import { ColorMap } from '../types';

// Карта соответствия градиентов к цветам
export const gradientColors: ColorMap = {
  '': '#ffffff', // Для опции "Без цвета"
  'from-blue-500 via-indigo-500 to-violet-600': '#6366f1',
  'from-emerald-500 via-teal-500 to-cyan-600': '#10b981',
  'from-amber-500 via-orange-500 to-yellow-500': '#f59e0b',
  'from-red-500 via-rose-500 to-pink-500': '#ef4444',
  'from-purple-500 via-violet-500 to-indigo-600': '#8b5cf6',
  'from-sky-500 via-blue-500 to-indigo-500': '#0ea5e9',
  'from-green-500 via-emerald-500 to-teal-500': '#22c55e',
  'from-yellow-500 via-amber-500 to-orange-500': '#eab308',
  'from-pink-500 via-rose-500 to-red-500': '#ec4899',
  'from-gray-500 via-gray-600 to-gray-700': '#6b7280',
  'from-stone-500 via-stone-600 to-stone-700': '#78716c',
  'from-lime-500 via-lime-600 to-green-600': '#84cc16',
  'from-fuchsia-500 via-purple-500 to-pink-500': '#d946ef',
  'from-rose-500 via-red-500 to-red-600': '#f43f5e',
  'from-teal-500 via-cyan-500 to-sky-500': '#14b8a6'
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
          ['blue-300', '#93c5fd'],
          ['indigo-300', '#a5b4fc'],
          ['violet-400', '#a78bfa'],
          ['emerald-300', '#6ee7b7'],
          ['teal-300', '#5eead4'],
          ['cyan-400', '#22d3ee'],
          ['amber-300', '#fcd34d'],
          ['orange-300', '#fdba74'],
          ['yellow-300', '#fde047'],
          ['red-300', '#fca5a5'],
          ['pink-300', '#f9a8d4'],
          ['purple-300', '#d8b4fe'],
          ['gray-300', '#d1d5db'],
          ['stone-300', '#d6d3d1'],
          ['lime-300', '#bef264'],
          ['fuchsia-300', '#f0abfc'],
          ['rose-300', '#fda4af'],
          ['sky-300', '#7dd3fc'],
        ]);
        return colorMap.get(firstColor) || '#e0e7ff';
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
    return '#e0e7ff'; // Светло-индиговый цвет по умолчанию
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
          ['blue-300', '#eff6ff'],
          ['indigo-300', '#eef2ff'],
          ['violet-400', '#f5f3ff'],
          ['emerald-300', '#ecfdf5'],
          ['teal-300', '#f0fdfa'],
          ['cyan-400', '#ecfeff'],
          ['amber-300', '#fffbeb'],
          ['orange-300', '#fff7ed'],
          ['yellow-300', '#fefce8'],
          ['red-300', '#fef2f2'],
          ['pink-300', '#fdf2f8'],
          ['purple-300', '#faf5ff'],
          ['gray-300', '#f9fafb'],
          ['stone-300', '#fafaf9'],
          ['lime-300', '#f7fee7'],
          ['fuchsia-300', '#fdf4ff'],
          ['rose-300', '#fff1f2'],
          ['sky-300', '#f0f9ff'],
        ]);
        return colorMap.get(firstColor) || '#f5f7ff';
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
    return '#f5f7ff'; // Очень светлый по умолчанию
  }
}; 