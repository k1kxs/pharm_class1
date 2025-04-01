import { Cycle } from '../components/types';
import html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toPng } from 'html-to-image';
import { gradientColors } from '../components/utils/colorUtils';
import html2canvas from 'html2canvas';

// Объявление типов для библиотеки html-to-image
declare module 'html-to-image' {
  export function toPng(node: HTMLElement, options?: any): Promise<string>;
  export function toJpeg(node: HTMLElement, options?: any): Promise<string>;
  export function toBlob(node: HTMLElement, options?: any): Promise<Blob>;
  export function toPixelData(node: HTMLElement, options?: any): Promise<Uint8Array>;
  export function toSvg(node: HTMLElement, options?: any): Promise<string>;
}

/**
 * Класс для экспорта классификации лекарственных средств в PDF
 */
export class PDFExporter {
  /**
   * Извлекает цвет из строки градиента Tailwind
   */
  private static getTailwindColor(colorClass: string): string {
    // Разделяем на части, например "from-blue-500" -> "blue-500"
    const parts = colorClass.split('-');
    if (parts.length < 2) return '#6366f1'; // По умолчанию индиго
    
    // Извлекаем основной цвет и оттенок
    const colorName = parts[1]; // например, "blue"
    const shade = parts[2] || '500'; // например, "500"
    
    // Таблица соответствия цветов Tailwind для синего/индиго диапазона
    const tailwindColors: Record<string, Record<string, string>> = {
      blue: {
        '50': '#eff6ff', '100': '#dbeafe', '200': '#bfdbfe', '300': '#93c5fd',
        '400': '#60a5fa', '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8',
        '800': '#1e40af', '900': '#1e3a8a', '950': '#172554'
      },
      indigo: {
        '50': '#eef2ff', '100': '#e0e7ff', '200': '#c7d2fe', '300': '#a5b4fc',
        '400': '#818cf8', '500': '#6366f1', '600': '#4f46e5', '700': '#4338ca',
        '800': '#3730a3', '900': '#312e81', '950': '#1e1b4b'
      },
      violet: {
        '50': '#f5f3ff', '100': '#ede9fe', '200': '#ddd6fe', '300': '#c4b5fd',
        '400': '#a78bfa', '500': '#8b5cf6', '600': '#7c3aed', '700': '#6d28d9',
        '800': '#5b21b6', '900': '#4c1d95', '950': '#2e1065'
      },
      purple: {
        '50': '#faf5ff', '100': '#f3e8ff', '200': '#e9d5ff', '300': '#d8b4fe',
        '400': '#c084fc', '500': '#a855f7', '600': '#9333ea', '700': '#7e22ce',
        '800': '#6b21a8', '900': '#581c87', '950': '#3b0764'
      },
      red: {
        '50': '#fef2f2', '100': '#fee2e2', '200': '#fecaca', '300': '#fca5a5',
        '400': '#f87171', '500': '#ef4444', '600': '#dc2626', '700': '#b91c1c',
        '800': '#991b1b', '900': '#7f1d1d', '950': '#450a0a'
      },
      amber: {
        '50': '#fffbeb', '100': '#fef3c7', '200': '#fde68a', '300': '#fcd34d',
        '400': '#fbbf24', '500': '#f59e0b', '600': '#d97706', '700': '#b45309',
        '800': '#92400e', '900': '#78350f', '950': '#451a03'
      },
      green: {
        '50': '#f0fdf4', '100': '#dcfce7', '200': '#bbf7d0', '300': '#86efac',
        '400': '#4ade80', '500': '#22c55e', '600': '#16a34a', '700': '#15803d',
        '800': '#166534', '900': '#14532d', '950': '#052e16'
      },
      emerald: {
        '50': '#ecfdf5', '100': '#d1fae5', '200': '#a7f3d0', '300': '#6ee7b7',
        '400': '#34d399', '500': '#10b981', '600': '#059669', '700': '#047857',
        '800': '#065f46', '900': '#064e3b', '950': '#022c22'
      },
      teal: {
        '50': '#f0fdfa', '100': '#ccfbf1', '200': '#99f6e4', '300': '#5eead4',
        '400': '#2dd4bf', '500': '#14b8a6', '600': '#0d9488', '700': '#0f766e',
        '800': '#115e59', '900': '#134e4a', '950': '#042f2e'
      },
      cyan: {
        '50': '#ecfeff', '100': '#cffafe', '200': '#a5f3fc', '300': '#67e8f9',
        '400': '#22d3ee', '500': '#06b6d4', '600': '#0891b2', '700': '#0e7490',
        '800': '#155e75', '900': '#164e63', '950': '#083344'
      },
      sky: {
        '50': '#f0f9ff', '100': '#e0f2fe', '200': '#bae6fd', '300': '#7dd3fc',
        '400': '#38bdf8', '500': '#0ea5e9', '600': '#0284c7', '700': '#0369a1',
        '800': '#075985', '900': '#0c4a6e', '950': '#082f49'
      },
      gray: {
        '50': '#f9fafb', '100': '#f3f4f6', '200': '#e5e7eb', '300': '#d1d5db',
        '400': '#9ca3af', '500': '#6b7280', '600': '#4b5563', '700': '#374151',
        '800': '#1f2937', '900': '#111827', '950': '#030712'
      },
      stone: {
        '50': '#fafaf9', '100': '#f5f5f4', '200': '#e7e5e4', '300': '#d6d3d1',
        '400': '#a8a29e', '500': '#78716c', '600': '#57534e', '700': '#44403c',
        '800': '#292524', '900': '#1c1917', '950': '#0c0a09'
      },
      pink: {
        '50': '#fdf2f8', '100': '#fce7f3', '200': '#fbcfe8', '300': '#f9a8d4',
        '400': '#f472b6', '500': '#ec4899', '600': '#db2777', '700': '#be185d',
        '800': '#9d174d', '900': '#831843', '950': '#500724'
      },
      rose: {
        '50': '#fff1f2', '100': '#ffe4e6', '200': '#fecdd3', '300': '#fda4af',
        '400': '#fb7185', '500': '#f43f5e', '600': '#e11d48', '700': '#be123c',
        '800': '#9f1239', '900': '#881337', '950': '#4c0519'
      },
      yellow: {
        '50': '#fefce8', '100': '#fef9c3', '200': '#fef08a', '300': '#fde047',
        '400': '#facc15', '500': '#eab308', '600': '#ca8a04', '700': '#a16207',
        '800': '#854d0e', '900': '#713f12', '950': '#422006'
      },
      orange: {
        '50': '#fff7ed', '100': '#ffedd5', '200': '#fed7aa', '300': '#fdba74',
        '400': '#fb923c', '500': '#f97316', '600': '#ea580c', '700': '#c2410c',
        '800': '#9a3412', '900': '#7c2d12', '950': '#431407'
      },
      lime: {
        '50': '#f7fee7', '100': '#ecfccb', '200': '#d9f99d', '300': '#bef264',
        '400': '#a3e635', '500': '#84cc16', '600': '#65a30d', '700': '#4d7c0f',
        '800': '#3f6212', '900': '#365314', '950': '#1a2e05'
      },
      fuchsia: {
        '50': '#fdf4ff', '100': '#fae8ff', '200': '#f5d0fe', '300': '#f0abfc',
        '400': '#e879f9', '500': '#d946ef', '600': '#c026d3', '700': '#a21caf',
        '800': '#86198f', '900': '#701a75', '950': '#4a044e'
      }
    };
    
    // Получаем цвет, если определен
    if (tailwindColors[colorName] && tailwindColors[colorName][shade]) {
      return tailwindColors[colorName][shade];
    }
    
    // Используем значение из таблицы соответствия, если есть
    const colorKey = `${colorClass}`;
    if (gradientColors[colorKey]) {
      return gradientColors[colorKey];
    }
    
    // Возвращаем цвет по умолчанию
    return '#6366f1'; // Индиго по умолчанию
  }

  /**
   * Извлекает первый цвет из строки (градиента или простого цвета)
   */
  private static getPrimaryColor(colorString: string | undefined | null, defaultColor: string): string {
    if (!colorString) {
      return defaultColor;
    }
    
    // Проверяем, это строка градиента Tailwind?
    if (colorString.startsWith('from-')) {
      // Это класс Tailwind градиента
      return this.getTailwindColor(colorString);
    }
    
    // Проверяем Tailwind градиент в полной записи
    if (colorString.includes('from-') && colorString.includes('to-')) {
      // Извлекаем часть from-*
      const fromMatch = colorString.match(/from-[a-z]+-\d+/);
      if (fromMatch) {
        return this.getTailwindColor(fromMatch[0]);
      }
    }
    
    // Проверяем, это Tailwind градиент? Если да, ищем соответствие в таблице цветов
    if (gradientColors[colorString]) {
      return gradientColors[colorString];
    }
    
    // Простой парсинг: ищем hex, rgb(a), hsl(a) или именованный цвет
    const colorMatch = colorString.match(/#[0-9a-fA-F]{3,6}|rgba?\(.+?\)|hsla?\(.+?\)|[a-zA-Z]+/);
    return colorMatch ? colorMatch[0] : defaultColor;
  }

  /**
   * Экспортирует выбранные циклы в PDF
   */
  static async exportToPDF(cycles: Cycle[], selectedCycleIds: number[]): Promise<void> {
    const selectedCycles = cycles.filter(cycle => selectedCycleIds.includes(cycle.id));
    
    // Проверка на наличие данных
    if (selectedCycles.length === 0) {
      console.warn('Нет выбранных циклов для экспорта');
      alert('Пожалуйста, выберите хотя бы один цикл для экспорта');
      return;
    }
    
    // Выбираем метод экспорта
    try {
      console.log('Создание PDF с использованием современного метода...');
      await this.exportModernPDF(selectedCycles);
    } catch (error) {
      console.error('Ошибка при создании PDF через основной метод:', error);
      
      try {
        // Запасной метод
        console.log('Пробуем альтернативный метод с jsPDF...');
        this.exportWithJsPDF(selectedCycles);
      } catch (jsPdfError) {
        console.error('Ошибка при создании PDF через запасной метод:', jsPdfError);
        alert('Не удалось создать PDF. Пожалуйста, попробуйте еще раз или обратитесь в поддержку.');
      }
    }
  }
  
  /**
   * Загружает шрифты Inter для использования в PDF
   */
  private static async loadFonts(): Promise<void> {
    try {
      // Проверяем, есть ли уже загруженные шрифты Inter
      const existingFontLink = document.querySelector('link[href*="fonts.googleapis.com/css2?family=Inter"]');
      
      if (!existingFontLink) {
        // Предзагрузка шрифтов для корректного отображения в PDF
        const fontStyleSheet = document.createElement('link');
        fontStyleSheet.rel = 'stylesheet';
        fontStyleSheet.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
        document.head.appendChild(fontStyleSheet);
        
        // Добавляем шрифт Inter непосредственно в document для гарантированного использования
        const fontStyle = document.createElement('style');
        fontStyle.textContent = `
          @font-face {
            font-family: 'Inter';
            font-style: normal;
            font-weight: 400;
            font-display: swap;
            src: url(https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2) format('woff2');
          }
          @font-face {
            font-family: 'Inter';
            font-style: normal;
            font-weight: 500;
            font-display: swap;
            src: url(https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2) format('woff2');
          }
          @font-face {
            font-family: 'Inter';
            font-style: normal;
            font-weight: 600;
            font-display: swap;
            src: url(https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2) format('woff2');
          }
          @font-face {
            font-family: 'Inter';
            font-style: normal;
            font-weight: 700;
            font-display: swap;
            src: url(https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2) format('woff2');
          }
        `;
        document.head.appendChild(fontStyle);
      }
      
      // Создаем скрытый элемент для активации шрифтов
      const fontTester = document.createElement('div');
      fontTester.style.fontFamily = 'Inter, sans-serif';
      fontTester.style.position = 'absolute';
      fontTester.style.left = '-9999px';
      fontTester.style.visibility = 'hidden';
      fontTester.textContent = 'Тестирование загрузки шрифта Inter';
      document.body.appendChild(fontTester);
      
      // Даем достаточно времени для загрузки шрифтов
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Удаляем тестовый элемент
      if (fontTester.parentNode) {
        fontTester.parentNode.removeChild(fontTester);
      }
      
      console.log('Шрифты успешно загружены для PDF');
      return Promise.resolve();
    } catch (error) {
      console.warn('Ошибка при загрузке шрифтов:', error);
      // Продолжаем даже при ошибке загрузки шрифтов
      return Promise.resolve();
    }
  }
  
  /**
   * Современный метод экспорта, точно воспроизводящий стиль веб-интерфейса
   */
  private static async exportModernPDF(cycles: Cycle[]): Promise<void> {
    // Загрузка шрифтов для точного воспроизведения веб-интерфейса
    await this.loadFonts();
    
    console.log('Создание структуры PDF для циклов...');
    
    // Создаем видимый контейнер для надежного рендеринга
    const container = document.createElement('div');
    container.id = 'cycles-pdf-container';
    container.style.width = '210mm';
    container.style.backgroundColor = 'white';
    container.style.position = 'fixed';
    container.style.zIndex = '9999';
    container.style.top = '0';
    container.style.left = '0';
    container.style.opacity = '0.01'; // Практически невидимый
    container.style.padding = '10mm';
    container.style.boxSizing = 'border-box';
    
    // Добавляем глобальные стили, которые точно соответствуют веб-интерфейсу
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      
      #cycles-pdf-container {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #1f2937;
        line-height: 1.6;
        font-size: 14px;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      #cycles-pdf-container * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .cycle-page-break {
        page-break-after: always;
        break-after: page;
        height: 0;
        display: block;
      }
      
      .cycle-header {
        text-align: center;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid #e5e7eb;
      }
      
      .cycle-title {
        font-size: 24px;
        font-weight: 700;
        color: #111827;
        margin-bottom: 8px;
      }
      
      .cycle-subtitle {
        font-size: 14px;
        color: #6b7280;
      }
      
      .cycle-item {
        margin-bottom: 30px;
        overflow: hidden;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
      }
      
      .cycle-item-header {
        padding: 15px 18px;
        font-size: 18px;
        font-weight: 700;
        color: white;
        border-radius: 8px 8px 0 0;
        display: flex;
        align-items: center;
      }
      
      .cycle-item-content {
        padding: 15px;
        background-color: #ffffff;
        border: 1px solid #e5e7eb;
        border-top: none;
        border-radius: 0 0 8px 8px;
      }
      
      .cycle-group {
        margin-bottom: 20px;
        border-radius: 6px;
        overflow: hidden;
        background: white;
        border: 1px solid #e5e7eb;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }
      
      .cycle-group-header {
        padding: 12px 15px;
        font-size: 16px;
        font-weight: 600;
        color: white;
        display: flex;
        align-items: center;
      }
      
      .cycle-group-content {
        padding: 15px;
        background-color: #ffffff;
      }
      
      .cycle-subgroup {
        margin: 0 0 15px 10px;
      }
      
      .cycle-subgroup-header {
        padding: 10px 15px;
        margin-bottom: 10px;
        font-size: 15px;
        font-weight: 500;
        background-color: #f9fafb;
        border-radius: 4px;
        border-left: 4px solid;
        color: #374151;
      }
      
      .cycle-category {
        margin: 0 0 12px 15px;
      }
      
      .cycle-category-header {
        padding: 8px 15px;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        border-left: 3px solid #d1d5db;
        color: #4b5563;
      }
      
      .cycle-preparations {
        margin: 0 0 15px 20px;
        font-size: 13px;
        line-height: 1.5;
        color: #4b5563;
      }
      
      .cycle-preparations p {
        margin-bottom: 8px;
      }
      
      .cycle-preparations strong,
      .cycle-preparations b {
        font-weight: 600;
        color: #1f2937;
      }
      
      .cycle-preparations ul, 
      .cycle-preparations ol {
        padding-left: 20px;
        margin-bottom: 10px;
      }
      
      .cycle-preparations li {
        margin-bottom: 5px;
      }
      
      .cycle-footer {
        margin-top: 30px;
        padding-top: 10px;
        text-align: center;
        font-size: 10px;
        color: #9ca3af;
        border-top: 1px solid #e5e7eb;
      }
    `;
    
    document.head.appendChild(styleElement);
    
    // Создаем заголовок документа
    const header = document.createElement('div');
    header.className = 'cycle-header';
    
    const title = document.createElement('div');
    title.className = 'cycle-title';
    title.textContent = 'Классификация лекарственных средств';
    header.appendChild(title);
    
    const subtitle = document.createElement('div');
    subtitle.className = 'cycle-subtitle';
    subtitle.textContent = 'Справочник для медицинских специалистов';
    header.appendChild(subtitle);
    
    container.appendChild(header);
    
    // Добавляем циклы в контейнер
    cycles.forEach((cycle, cycleIndex) => {
      // Создаем контейнер цикла
      const cycleContainer = document.createElement('div');
      cycleContainer.className = 'cycle-item';
      
      // Заголовок цикла с градиентом
      const cycleHeader = document.createElement('div');
      cycleHeader.className = 'cycle-item-header';
      
      // Применяем градиент или цвет к заголовку цикла
      if (cycle.gradient && cycle.gradient.startsWith('from-')) {
        // Разбираем строку градиента Tailwind
        const gradientParts = cycle.gradient.split(' ');
        
        // Находим части градиента (from, via, to)
        const fromPart = gradientParts.find(part => part.startsWith('from-'));
        const viaPart = gradientParts.find(part => part.startsWith('via-'));
        const toPart = gradientParts.find(part => part.startsWith('to-'));
        
        // Получаем цвета для каждой части
        const fromColor = fromPart ? this.getTailwindColor(fromPart) : '#6366f1';
        const viaColor = viaPart ? this.getTailwindColor(viaPart) : null;
        const toColor = toPart ? this.getTailwindColor(toPart) : '#818cf8';
        
        // Создаем CSS градиент в зависимости от наличия "via" части
        if (viaColor) {
          cycleHeader.style.background = `linear-gradient(to right, ${fromColor}, ${viaColor}, ${toColor})`;
        } else {
          cycleHeader.style.background = `linear-gradient(to right, ${fromColor}, ${toColor})`;
        }
      } else {
        // Для простого цвета
        cycleHeader.style.backgroundColor = this.getPrimaryColor(cycle.gradient, '#4338ca');
      }
      
      // Определяем, должен ли текст быть белым или черным в зависимости от яркости фона
      const cycleColor = this.getPrimaryColor(cycle.gradient, '#4338ca');
      cycleHeader.style.color = this.isColorLight(cycleColor) ? '#111827' : '#ffffff';
      
      // Добавляем имя цикла
      cycleHeader.textContent = cycle.name;
      cycleContainer.appendChild(cycleHeader);
      
      // Создаем контейнер для содержимого цикла
      const cycleContent = document.createElement('div');
      cycleContent.className = 'cycle-item-content';
      
      // Добавляем группы
      if (cycle.groups && cycle.groups.length > 0) {
        cycle.groups.forEach(group => {
          // Создаем контейнер для группы
          const groupContainer = document.createElement('div');
          groupContainer.className = 'cycle-group';
          
          // Заголовок группы
          const groupHeader = document.createElement('div');
          groupHeader.className = 'cycle-group-header';
          
          // Применяем градиент или цвет к заголовку группы
          const groupGradient = group.gradient || cycle.gradient;
          
          if (groupGradient && groupGradient.startsWith('from-')) {
            // Разбираем строку градиента Tailwind
            const gradientParts = groupGradient.split(' ');
            
            // Находим части градиента (from, via, to)
            const fromPart = gradientParts.find(part => part.startsWith('from-'));
            const viaPart = gradientParts.find(part => part.startsWith('via-'));
            const toPart = gradientParts.find(part => part.startsWith('to-'));
            
            // Получаем цвета для каждой части
            const fromColor = fromPart ? this.getTailwindColor(fromPart) : '#6366f1';
            const viaColor = viaPart ? this.getTailwindColor(viaPart) : null;
            const toColor = toPart ? this.getTailwindColor(toPart) : '#818cf8';
            
            // Создаем CSS градиент в зависимости от наличия "via" части
            if (viaColor) {
              groupHeader.style.background = `linear-gradient(to right, ${fromColor}, ${viaColor}, ${toColor})`;
            } else {
              groupHeader.style.background = `linear-gradient(to right, ${fromColor}, ${toColor})`;
            }
          } else {
            // Для простого цвета
            groupHeader.style.backgroundColor = this.getPrimaryColor(groupGradient, '#4338ca');
          }
          
          // Определяем, должен ли текст быть белым или черным
          const groupColor = this.getPrimaryColor(groupGradient, '#4338ca');
          groupHeader.style.color = this.isColorLight(groupColor) ? '#111827' : '#ffffff';
          
          // Добавляем имя группы
          groupHeader.textContent = group.name;
          groupContainer.appendChild(groupHeader);
          
          // Создаем контейнер для содержимого группы
          const groupContent = document.createElement('div');
          groupContent.className = 'cycle-group-content';
          
          // Добавляем препараты группы (если есть)
          if (group.preparations && group.preparations.trim()) {
            const preparationsDiv = document.createElement('div');
            preparationsDiv.className = 'cycle-preparations';
            preparationsDiv.innerHTML = group.preparations;
            groupContent.appendChild(preparationsDiv);
          }
          
          // Добавляем подгруппы
          if (group.subgroups && group.subgroups.length > 0) {
            group.subgroups.forEach(subgroup => {
              // Контейнер подгруппы
              const subgroupContainer = document.createElement('div');
              subgroupContainer.className = 'cycle-subgroup';
              
              // Заголовок подгруппы
              const subgroupHeader = document.createElement('div');
              subgroupHeader.className = 'cycle-subgroup-header';
              subgroupHeader.textContent = subgroup.name;
              
              // Устанавливаем цвет границы (тот же что у группы)
              const groupColor = this.getPrimaryColor(groupGradient, '#4338ca');
              subgroupHeader.style.borderLeftColor = groupColor;
              
              subgroupContainer.appendChild(subgroupHeader);
              
              // Добавляем препараты подгруппы
              if (subgroup.preparations && subgroup.preparations.trim()) {
                const preparationsDiv = document.createElement('div');
                preparationsDiv.className = 'cycle-preparations';
                preparationsDiv.innerHTML = subgroup.preparations;
                subgroupContainer.appendChild(preparationsDiv);
              }
              
              // Добавляем категории
              if (subgroup.categories && subgroup.categories.length > 0) {
                subgroup.categories.forEach(category => {
                  // Контейнер категории
                  const categoryContainer = document.createElement('div');
                  categoryContainer.className = 'cycle-category';
                  
                  // Заголовок категории
                  const categoryHeader = document.createElement('div');
                  categoryHeader.className = 'cycle-category-header';
                  categoryHeader.textContent = category.name;
                  
                  // Устанавливаем цвет границы 
                  categoryHeader.style.borderLeftColor = groupColor;
                  
                  categoryContainer.appendChild(categoryHeader);
                  
                  // Препараты категории
                  if (category.preparations && category.preparations.trim()) {
                    const preparationsDiv = document.createElement('div');
                    preparationsDiv.className = 'cycle-preparations';
                    preparationsDiv.innerHTML = category.preparations;
                    categoryContainer.appendChild(preparationsDiv);
                  }
                  
                  subgroupContainer.appendChild(categoryContainer);
                });
              }
              
              groupContent.appendChild(subgroupContainer);
            });
          }
          
          groupContainer.appendChild(groupContent);
          cycleContent.appendChild(groupContainer);
        });
      } else {
        // Если нет групп, показываем сообщение
        const noGroupsMessage = document.createElement('div');
        noGroupsMessage.style.textAlign = 'center';
        noGroupsMessage.style.padding = '20px';
        noGroupsMessage.style.color = '#6b7280';
        noGroupsMessage.style.fontStyle = 'italic';
        noGroupsMessage.textContent = 'Нет групп в этом цикле';
        cycleContent.appendChild(noGroupsMessage);
      }
      
      cycleContainer.appendChild(cycleContent);
      container.appendChild(cycleContainer);
      
      // Добавляем разрыв страницы после каждого цикла кроме последнего
      if (cycleIndex < cycles.length - 1) {
        const pageBreak = document.createElement('div');
        pageBreak.className = 'cycle-page-break';
        container.appendChild(pageBreak);
      }
    });
    
    // Добавляем нижний колонтитул
    const footer = document.createElement('div');
    footer.className = 'cycle-footer';
    footer.textContent = `Классификация лекарственных средств © ${new Date().getFullYear()} | ФГБОУ ВО ОрГМУ Минздрава России`;
    container.appendChild(footer);
    
    // Добавляем контейнер в DOM для преобразования в PDF
    document.body.appendChild(container);
    
    try {
      console.log('Начало конвертации в PDF...');
      
      // Ждем загрузки всех шрифтов и изображений
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        // Сначала пробуем основной метод
        const options = {
          margin: [10, 10, 10, 10],
          filename: 'Классификация_лекарственных_средств.pdf',
          image: { 
            type: 'jpeg', 
            quality: 1.0
          },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: true,
            backgroundColor: '#FFFFFF',
            onclone: (clonedDoc: Document) => {
              console.log('HTML структура клонирована для PDF');
              return clonedDoc;
            }
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: true
          }
        };
        
        await html2pdf().from(container).set(options).save();
        console.log('PDF успешно создан');
      } catch (error) {
        console.error('Ошибка при создании PDF основным методом:', error);
        
        // Резервный метод с помощью html-to-image
        try {
          console.log('Запуск резервного метода экспорта...');
          
          // Генерируем изображение из DOM
          const dataUrl = await toPng(container, {
            quality: 1.0,
            backgroundColor: 'white',
            pixelRatio: 2
          });
          
          // Создаем PDF с использованием jsPDF
          const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });
          
          const imgProps = doc.getImageProperties(dataUrl);
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          
          // Вычисляем размеры для изображения
          const imgWidth = pageWidth - 20;
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
          
          // Добавляем изображение на страницу
          if (imgHeight <= pageHeight - 20) {
            doc.addImage(dataUrl, 'PNG', 10, 10, imgWidth, imgHeight);
          } else {
            // Если изображение слишком большое, разбиваем на несколько страниц
            let heightLeft = imgHeight;
            let position = 0;
            let page = 0;
            
            while (heightLeft > 0) {
              if (page > 0) {
                doc.addPage();
              }
              
              doc.addImage(dataUrl, 'PNG', 10, 10 - position, imgWidth, imgHeight);
              
              heightLeft -= pageHeight - 20;
              position += pageHeight - 20;
              page++;
            }
          }
          
          // Добавляем метаданные
          doc.setProperties({
            title: 'Классификация лекарственных средств',
            creator: 'PDF Exporter',
            author: 'PDF Exporter',
            subject: 'Экспорт данных',
            keywords: 'лекарственные средства, классификация'
          });
          
          // Сохраняем PDF
          doc.save('Классификация_лекарственных_средств.pdf');
          console.log('PDF успешно создан с использованием резервного метода');
        } catch (backupError) {
          console.error('Ошибка при создании PDF резервным методом:', backupError);
          alert('Не удалось создать PDF. Пожалуйста, попробуйте другой метод экспорта или обратитесь в поддержку.');
          throw backupError;
        }
      }
    } catch (error) {
      console.error('Ошибка при экспорте PDF:', error);
      throw error;
    } finally {
      // Удаляем временные элементы
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    }
  }
  
  /**
   * Проверяет, является ли цвет светлым (упрощенная проверка)
   * @param color Hex цвет (#RRGGBB)
   * @returns true если цвет светлый, иначе false
   */
  private static isColorLight(color: string): boolean {
    try {
      let r = 0, g = 0, b = 0;
      if (color.startsWith('#')) {
        if (color.length === 4) { // #RGB
          r = parseInt(color[1] + color[1], 16);
          g = parseInt(color[2] + color[2], 16);
          b = parseInt(color[3] + color[3], 16);
        } else if (color.length === 7) { // #RRGGBB
          r = parseInt(color.substring(1, 3), 16);
          g = parseInt(color.substring(3, 5), 16);
          b = parseInt(color.substring(5, 7), 16);
        } else {
          return false; // Неизвестный формат hex
        }
      } else {
        // TODO: Обработать rgb(), rgba(), именованные цвета, если нужно
        return false; // По умолчанию считаем темным для неизвестных форматов
      }

      // Формула вычисления яркости (Luma)
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      return luma > 160; // Пороговое значение, можно подбирать
    } catch (e) {
      console.error("Ошибка определения яркости цвета:", color, e);
      return false; // В случае ошибки считаем темным
    }
  }
  
  /**
   * Запасной метод экспорта с использованием jsPDF напрямую
   */
  private static exportWithJsPDF(cycles: Cycle[]): void {
    // Создаем документ
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Настраиваем шрифты
    doc.setFont('helvetica', 'normal');
    
    // Устанавливаем настройки страницы
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Добавляем заголовок документа
    doc.setFontSize(22);
    doc.setTextColor(51, 51, 51);
    doc.text('Классификация лекарственных средств', pageWidth / 2, margin, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(102, 102, 102);
    doc.text('Справочник для медицинских специалистов', pageWidth / 2, margin + 10, { align: 'center' });
    
    let y = margin + 25;
    
    // Добавляем циклы
    cycles.forEach((cycle, cycleIndex) => {
      // Проверяем, нужно ли перейти на следующую страницу
      if (y > pageHeight - margin - 30) {
        doc.addPage();
        y = margin;
      }
      
      // Заголовок цикла
      const cycleColor = this.hexToRgb(cycle.gradient || '#5b42f3');
      doc.setFillColor(cycleColor.r, cycleColor.g, cycleColor.b);
      
      // Рисуем прямоугольник для заголовка цикла
      doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
      
      // Название цикла
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text(cycle.name, margin + 5, y + 6);
      
      y += 15;
      
      // Обработка групп
      cycle.groups.forEach(group => {
        // Проверяем, нужно ли перейти на следующую страницу
        if (y > pageHeight - margin - 20) {
          doc.addPage();
          y = margin;
        }
        
        // Цвет группы
        const groupColor = this.hexToRgb(group.gradient || cycle.gradient || '#5b42f3');
        
        // Заголовок группы
        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51);
        doc.setDrawColor(groupColor.r, groupColor.g, groupColor.b);
        doc.setLineWidth(0.8);
        
        // Создаем более выразительный визуальный стиль для группы
        // Вертикальная полоса для группы (более широкая)
        doc.line(margin, y, margin, y + 7);
        
        // Легкий цветовой фон для заголовка группы (имитация градиента)
        doc.setFillColor(groupColor.r, groupColor.g, groupColor.b, 0.1);
        doc.rect(margin + 0.8, y - 3, contentWidth - 1.6, 10, 'F');
        
        // Название группы
        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51);
        doc.text(group.name, margin + 3, y + 4);
        
        y += 10;
        
        // Препараты группы
        if (group.preparations && group.preparations.trim()) {
          const plainText = this.stripHtml(group.preparations);
          const textLines = doc.splitTextToSize(plainText, contentWidth - 10);
          
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
          
          textLines.forEach((line: string) => {
            if (y > pageHeight - margin - 10) {
              doc.addPage();
              y = margin;
            }
            
            doc.text(line, margin + 5, y);
            y += 4;
          });
          
          y += 5;
        }
        
        // Подгруппы
        if (group.subgroups && group.subgroups.length > 0) {
          group.subgroups.forEach(subgroup => {
            if (y > pageHeight - margin - 15) {
              doc.addPage();
              y = margin;
            }
            
            // Название подгруппы
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            doc.setDrawColor(groupColor.r, groupColor.g, groupColor.b);
            doc.setLineWidth(0.5);
            
            // Вертикальная полоса для подгруппы
            doc.line(margin + 5, y, margin + 5, y + 5);
            
            // Название подгруппы
            doc.text(subgroup.name, margin + 8, y + 3);
            
            y += 8;
            
            // Препараты подгруппы
            if (subgroup.preparations && subgroup.preparations.trim()) {
              const plainText = this.stripHtml(subgroup.preparations);
              const textLines = doc.splitTextToSize(plainText, contentWidth - 15);
              
              doc.setFontSize(8);
              doc.setTextColor(90, 90, 90);
              
              textLines.forEach((line: string) => {
                if (y > pageHeight - margin - 10) {
                  doc.addPage();
                  y = margin;
                }
                
                doc.text(line, margin + 10, y);
                y += 3.5;
              });
              
              y += 4;
            }
            
            // Категории
            if (subgroup.categories && subgroup.categories.length > 0) {
              subgroup.categories.forEach(category => {
                if (y > pageHeight - margin - 15) {
                  doc.addPage();
                  y = margin;
                }
                
                // Название категории
                doc.setFontSize(9);
                doc.setTextColor(70, 70, 70);
                doc.text(category.name, margin + 12, y + 3);
                
                y += 6;
                
                // Препараты категории
                if (category.preparations && category.preparations.trim()) {
                  const plainText = this.stripHtml(category.preparations);
                  const textLines = doc.splitTextToSize(plainText, contentWidth - 20);
                  
                  doc.setFontSize(8);
                  doc.setTextColor(100, 100, 100);
                  
                  textLines.forEach((line: string) => {
                    if (y > pageHeight - margin - 10) {
                      doc.addPage();
                      y = margin;
                    }
                    
                    doc.text(line, margin + 15, y);
                    y += 3;
                  });
                  
                  y += 3;
                }
              });
            }
          });
        }
        
        y += 5;
      });
      
      // Добавляем разрыв страницы после каждого цикла, кроме последнего
      if (cycleIndex < cycles.length - 1) {
        doc.addPage();
        y = margin;
      }
    });
    
    // Подвал с номерами страниц
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Классификация лекарственных средств © ${new Date().getFullYear()} | Страница ${i} из ${totalPages}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    }
    
    // Скачиваем PDF
    doc.save('Классификация_лекарственных_средств.pdf');
  }
  
  /**
   * Преобразует HEX-цвет в RGB
   */
  private static hexToRgb(hex: string): { r: number, g: number, b: number } {
    try {
      // Проверяем, это Tailwind градиент? Если да, ищем соответствие в таблице цветов
      if (hex.startsWith('from-') && gradientColors[hex]) {
        hex = gradientColors[hex];
      }
      
      // Проверяем формат и удаляем # если есть
      const sanitizedHex = hex.startsWith('#') ? hex.substring(1) : hex;
      
      // Преобразуем в RGB
      const bigint = parseInt(sanitizedHex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      
      return { r, g, b };
    } catch (error) {
      console.error('Ошибка при преобразовании цвета:', hex, error);
      // Возвращаем стандартный синий цвет в случае ошибки
      return { r: 99, g: 102, b: 241 }; // #6366f1 - синий
    }
  }
  
  /**
   * Удаляет HTML-теги из строки
   */
  private static stripHtml(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }
  
  /**
   * Экспортирует элемент DOM в изображение и затем в PDF
   * Более продвинутый метод для сложных макетов
   */
  static async exportDomToPDF(domElement: HTMLElement, fileName: string): Promise<void> {
    try {
      // Делаем копию элемента, чтобы не модифицировать оригинал
      const clone = domElement.cloneNode(true) as HTMLElement;
      
      // Устанавливаем нужные стили для печати
      clone.style.width = '210mm';
      clone.style.backgroundColor = 'white';
      clone.style.padding = '10mm';
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      
      // Добавляем в DOM
      document.body.appendChild(clone);
      
      try {
        // Конвертируем в изображение
        const dataUrl = await toPng(clone, { 
          quality: 1.0,
          backgroundColor: 'white',
          pixelRatio: 2
        });
        
        // Создаем PDF с изображением
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgProps = doc.getImageProperties(dataUrl);
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Вычисляем размеры для сохранения пропорций
        const imgWidth = pageWidth - 20;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        
        // Добавляем изображение на страницу (упрощенный вариант)
        // Если изображение слишком большое, создаем несколько страниц
        if (imgHeight <= pageHeight - 20) {
          // Если изображение помещается на одну страницу
          doc.addImage(dataUrl, 'PNG', 10, 10, imgWidth, imgHeight);
        } else {
          // Если изображение слишком большое, разбиваем на несколько страниц
          let heightLeft = imgHeight;
          let position = 0;
          let page = 0;
          
          while (heightLeft > 0) {
            // Добавляем страницу, кроме первой
            if (page > 0) {
              doc.addPage();
            }
            
            // Добавляем часть изображения
            doc.addImage(dataUrl, 'PNG', 10, 10 - position, imgWidth, imgHeight);
            
            // Вычисляем оставшуюся высоту и позицию
            heightLeft -= pageHeight - 20;
            position += pageHeight - 20;
            page++;
          }
        }
        
        // Сохраняем PDF
        doc.save(fileName);
      } finally {
        // Удаляем временный элемент
        if (clone.parentNode) {
          clone.parentNode.removeChild(clone);
        }
      }
    } catch (error) {
      console.error('Ошибка при экспорте DOM в PDF:', error);
      throw error;
    }
  }

  /**
   * Экспортирует элемент DOM максимально точно в PDF
   * Использует html2pdf с улучшенными настройками для идеального воспроизведения
   */
  static async exportDomExactToPDF(domElement: HTMLElement, fileName: string): Promise<void> {
    try {
      console.log('Начало экспорта DOM в PDF:', fileName);
      
      // Сначала загружаем шрифты
      await this.loadFonts();
      
      // Создаем видимый контейнер для более надежного рендеринга
      const container = document.createElement('div');
      container.id = 'pdf-render-container';
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '210mm';
      container.style.backgroundColor = 'white';
      container.style.zIndex = '9999';
      container.style.display = 'block';
      container.style.opacity = '0.01'; // Практически невидимый, но рендерится
      
      // Делаем полную копию элемента
      const clone = domElement.cloneNode(true) as HTMLElement;
      
      // Устанавливаем фиксированный размер и стили
      clone.style.width = '210mm';
      clone.style.margin = '0';
      clone.style.padding = '10mm';
      clone.style.boxSizing = 'border-box';
      container.appendChild(clone);
      
      // Добавляем все необходимые стили для корректного отображения
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        #pdf-render-container * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        @page {
          margin: 0;
          size: A4;
        }
      `;
      document.head.appendChild(styleElement);
      
      // Добавляем контейнер в DOM для рендеринга
      document.body.appendChild(container);
      
      console.log('DOM подготовлен для экспорта, ожидание рендеринга...');
      
      try {
        // Увеличиваем время ожидания для гарантированной загрузки шрифтов и рендеринга
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('Начало создания PDF с html2pdf...');
        
        // Настройки для высококачественного PDF
        const options = {
          filename: fileName || 'Экспорт.pdf',
          image: { 
            type: 'jpeg', 
            quality: 1.0
          },
          html2canvas: {
            scale: 3, // Баланс между качеством и производительностью
            useCORS: true,
            allowTaint: true,
            logging: true, // Включаем логи для отладки
            backgroundColor: '#FFFFFF',
            onclone: (clonedDoc: Document) => {
              console.log('HTML клонирован для PDF экспорта');
              return clonedDoc;
            }
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: true
          },
          margin: [5, 5, 5, 5] // Минимальные отступы для сохранения содержимого
        };
        
        // Сначала попробуем с помощью html2pdf
        await html2pdf().from(container).set(options).save();
        console.log('PDF успешно создан с html2pdf');
      } catch (error) {
        console.error('Ошибка при создании PDF с html2pdf:', error);
        
        // Резервный метод с использованием html-to-image и jsPDF
        try {
          console.log('Использую резервный метод с html-to-image и jsPDF...');
          
          // Конвертируем DOM в изображение
          const dataUrl = await toPng(container, {
            quality: 1.0,
            backgroundColor: 'white',
            pixelRatio: 2,
            fetchRequestInit: {
              cache: 'force-cache'
            }
          });
          
          // Создаем PDF с изображением
          const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });
          
          const imgProps = doc.getImageProperties(dataUrl);
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          
          // Вычисляем размеры для сохранения пропорций
          const imgWidth = pageWidth - 10;
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
          
          // Добавляем изображение на страницу
          if (imgHeight <= pageHeight - 10) {
            doc.addImage(dataUrl, 'PNG', 5, 5, imgWidth, imgHeight);
          } else {
            // Если изображение большое, разбиваем на страницы
            let heightLeft = imgHeight;
            let position = 0;
            let page = 0;
            
            while (heightLeft > 0) {
              if (page > 0) {
                doc.addPage();
              }
              
              // Добавляем часть изображения
              doc.addImage(dataUrl, 'PNG', 5, 5 - position, imgWidth, imgHeight);
              
              // Вычисляем оставшуюся высоту
              heightLeft -= pageHeight - 10;
              position += pageHeight - 10;
              page++;
            }
          }
          
          // Сохраняем PDF
          doc.save(fileName);
          console.log('PDF успешно создан с использованием резервного метода');
        } catch (fallbackError) {
          console.error('Ошибка при использовании резервного метода:', fallbackError);
          
          // Показываем пользователю сообщение об ошибке
          alert('Не удалось создать PDF. Возможно, проблема с отображением контента. Попробуйте еще раз или обратитесь в поддержку.');
          throw fallbackError;
        }
      }
    } catch (error) {
      console.error('Критическая ошибка при экспорте в PDF:', error);
      throw error;
    }
  }

  /**
   * Захватывает элемент DOM и экспортирует его в PDF с максимальной надежностью
   * Использует прямой подход для гарантированного создания PDF
   */
  static async captureAndExportToPDF(domElement: HTMLElement, fileName: string): Promise<void> {
    try {
      console.log('[PDFExporter] Начало надежного экспорта DOM в PDF:', fileName);
      
      // 1. Сохраняем оригинальное состояние элемента (на всякий случай)
      const originalDisplay = domElement.style.display;
      // ... (можно добавить сохранение других стилей при необходимости)
      
      // 2. Создаем контейнер для клона
      const container = document.createElement('div');
      container.id = 'pdf-export-container-temp';
      container.style.position = 'fixed'; // Фиксированное позиционирование для рендеринга
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '210mm'; // Ширина A4
      container.style.height = 'auto'; // Высота будет определена по контенту
      container.style.backgroundColor = 'white';
      container.style.zIndex = '10000'; // Максимальный z-index
      container.style.padding = '0';
      container.style.margin = '0';
      container.style.overflow = 'visible'; // Важно, чтобы весь контент был виден
      container.style.visibility = 'visible';
      container.style.opacity = '1';
      console.log('[PDFExporter] Контейнер создан');

      // 3. Клонируем содержимое
      const clone = domElement.cloneNode(true) as HTMLElement;
      clone.style.margin = '0'; // Убираем внешние отступы клона
      clone.style.padding = '10mm'; // Добавляем внутренние отступы для полей PDF
      clone.style.width = '100%';
      clone.style.height = 'auto';
      clone.style.boxSizing = 'border-box';
      clone.style.backgroundColor = 'white';
      container.appendChild(clone);
      console.log('[PDFExporter] Элемент клонирован');

      // 4. Добавляем специфичные для PDF стили
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        #pdf-export-container-temp, #pdf-export-container-temp * {
          font-family: 'Inter', sans-serif !important;
          color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          box-sizing: border-box !important;
        }
        #pdf-export-container-temp {
           overflow: visible !important; /* Убедимся, что контейнер не обрезает */
        }
        #pdf-export-container-temp img {
           max-width: 100% !important; /* Предотвращаем выход изображений за рамки */
           height: auto !important;
        }
        
        @page { 
           margin: 0; /* Убираем системные поля печати */
        }
      `;
      document.head.appendChild(styleEl);
      console.log('[PDFExporter] Стили добавлены');

      // 5. Добавляем контейнер в DOM
      document.body.appendChild(container);
      console.log('[PDFExporter] Контейнер добавлен в DOM');

      // 6. Вычисляем реальную высоту контента и устанавливаем ее для контейнера
      const contentHeight = container.scrollHeight;
      container.style.height = `${contentHeight}px`;
      console.log(`[PDFExporter] Вычислена высота контента: ${contentHeight}px`);

      // 7. Даем ВРЕМЯ для рендеринга (ключевой момент)
      console.log('[PDFExporter] Ожидание рендеринга (2 секунды)...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Увеличил время

      try {
        console.log('[PDFExporter] Начало захвата с html2canvas...');
        
        // 8. Захватываем контейнер с помощью html2canvas
        const canvas = await html2canvas(container, {
          scale: 2, // Умеренное разрешение для баланса качества/производительности
          useCORS: true,
          allowTaint: false, // Лучше избегать, если возможно
          backgroundColor: '#FFFFFF',
          logging: true,
          width: container.scrollWidth, // Используем scrollWidth
          height: contentHeight, // Используем вычисленную высоту
          windowWidth: container.scrollWidth,
          windowHeight: contentHeight,
          scrollX: 0,
          scrollY: 0,
          removeContainer: false // Не удаляем контейнер сами
        });
        
        console.log(`[PDFExporter] Canvas создан: ${canvas.width}x${canvas.height}`);
        
        // ***** DEBUG: Visualize Canvas *****
        try {
            console.log('[PDFExporter] DEBUG: Попытка добавить canvas в DOM для визуализации...');
            canvas.style.position = 'fixed';
            canvas.style.top = '10px';
            canvas.style.left = '10px';
            canvas.style.zIndex = '20000'; // Выше всего остального
            canvas.style.border = '2px solid red';
            canvas.style.transform = 'scale(0.2)'; // Уменьшим для отображения
            canvas.style.transformOrigin = 'top left';
            document.body.appendChild(canvas);
            console.log('[PDFExporter] DEBUG: Canvas должен быть виден в верхнем левом углу (красная рамка, уменьшенный).');
            // Оставляем canvas на 5 секунд для просмотра
            await new Promise(resolve => setTimeout(resolve, 5000));
            // Удаляем canvas после просмотра
            if (canvas.parentNode) {
                 canvas.parentNode.removeChild(canvas);
                 console.log('[PDFExporter] DEBUG: Canvas удален из DOM.');
            }
        } catch (visError) {
             console.error('[PDFExporter] DEBUG: Ошибка при визуализации canvas:', visError);
        }
        // ***** END DEBUG *****

        // 9. Получаем данные изображения
        const imgData = canvas.toDataURL('image/png', 1.0);
        if (!imgData || imgData === 'data:,' || imgData.length < 100) { // Более строгая проверка
           console.error(`[PDFExporter] Ошибка: Получены пустые или некорректные данные изображения из canvas. Начало данных: ${imgData.substring(0, 100)}`);
           throw new Error('Не удалось получить данные изображения из canvas (он пуст или содержит ошибку)');
        }
        console.log(`[PDFExporter] Image data URL получен (начало): ${imgData.substring(0, 100)}...`);

        // 10. Создаем PDF документ
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true
        });
        
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        const margin = 5; // Отступы в PDF
        const contentPdfWidth = pdfWidth - margin * 2;
        const contentPdfHeight = pdfHeight - margin * 2;
        
        // 11. Рассчитываем размеры изображения в PDF
        const imgProps = doc.getImageProperties(imgData);
        const imgRatio = imgProps.width / imgProps.height;
        let finalImgWidth = contentPdfWidth;
        let finalImgHeight = finalImgWidth / imgRatio;

        console.log(`[PDFExporter] Размеры изображения: ${imgProps.width}x${imgProps.height}, Соотношение: ${imgRatio}`);
        console.log(`[PDFExporter] Область контента PDF: ${contentPdfWidth}x${contentPdfHeight}`);
        console.log(`[PDFExporter] Рассчитанные размеры в PDF: ${finalImgWidth}x${finalImgHeight}`);
        
        // 12. Добавляем изображение в PDF (с пагинацией)
        let currentHeight = 0;
        const pageHeightToUse = contentPdfHeight; // Сколько высоты использовать на одной странице PDF
        let page = 0;
        
        while (currentHeight < finalImgHeight) {
            page++;
            if (page > 1) {
              doc.addPage();
            }
            const remainingHeight = finalImgHeight - currentHeight;
            const heightOnPage = Math.min(pageHeightToUse, remainingHeight);
            
            console.log(`[PDFExporter] Добавление страницы ${page}: Позиция Y = ${-currentHeight / (finalImgHeight/imgProps.height)}, Высота на странице = ${heightOnPage}`);
            
            // Используем addImage с параметрами обрезки, чтобы правильно разместить части изображения
            doc.addImage(
                imgData, 
                'PNG', 
                margin, // x
                margin - (currentHeight * (pageHeightToUse / heightOnPage)), // y - корректировка для следующих страниц
                finalImgWidth, // width
                finalImgHeight // height
            );
            
            currentHeight += heightOnPage;
        }
        
        console.log(`[PDFExporter] Добавлено страниц: ${page}`);
        
        // 13. Сохраняем PDF
        doc.save(fileName || 'Экспорт.pdf');
        console.log('[PDFExporter] PDF успешно сохранен');

      } catch (error) {
        console.error('[PDFExporter] Ошибка при основном методе (html2canvas -> jsPDF):', error);
        
        // 14. Попытка резервного метода с toPng (упрощенная)
        try {
          console.log('[PDFExporter] Пробую резервный метод с toPng...');
          const dataUrl = await toPng(container, { pixelRatio: 2, backgroundColor: 'white' });
          
          if (!dataUrl || dataUrl === 'data:,') {
             throw new Error('Не удалось получить данные изображения из toPng (возможно, он пуст)');
          }

          const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
          const pdfWidth = doc.internal.pageSize.getWidth();
          const pdfHeight = doc.internal.pageSize.getHeight();
          const imgProps = doc.getImageProperties(dataUrl);
          const imgWidth = pdfWidth - 10;
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
          
          doc.addImage(dataUrl, 'PNG', 5, 5, imgWidth, imgHeight); // Упрощенное добавление без пагинации для резерва
          doc.save(fileName || 'Экспорт_резерв.pdf');
          console.log('[PDFExporter] PDF создан резервным методом (toPng)');
        } catch (backupError) {
          console.error('[PDFExporter] Ошибка при использовании резервного метода (toPng):', backupError);
          alert('Не удалось создать PDF ни одним из методов. Проверьте консоль разработчика (F12) на наличие ошибок.');
          throw backupError; // Перебрасываем ошибку дальше
        }
      } finally {
        // 15. Очистка: удаляем временные элементы и восстанавливаем стили
        // *** DEBUG: Убедимся, что canvas удален, если он остался ***
        const debugCanvas = document.querySelector('canvas[style*="border: 2px solid red"]');
        if (debugCanvas && debugCanvas.parentNode) {
             console.log('[PDFExporter] DEBUG: Принудительное удаление canvas в finally.');
             debugCanvas.parentNode.removeChild(debugCanvas);
        }
        // *** END DEBUG ***

        if (container.parentNode) {
          console.log('[PDFExporter] Удаление временного контейнера');
          container.parentNode.removeChild(container);
        }
        if (styleEl.parentNode) {
          console.log('[PDFExporter] Удаление временных стилей');
          styleEl.parentNode.removeChild(styleEl);
        }
        domElement.style.display = originalDisplay;
        // ... (восстановление других стилей при необходимости)
        console.log('[PDFExporter] Экспорт завершен.');
      }
    } catch (error) { // Эта строка (1578) вызывала ошибку
      console.error('[PDFExporter] Критическая ошибка при экспорте в PDF:', error);
      alert('Произошла критическая ошибка при создании PDF. Подробности в консоли.');
      throw error;
    }
  }
}
