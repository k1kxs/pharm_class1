import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Download, Bug } from 'lucide-react';

interface PDFExportButtonProps {
  className?: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
  stack?: string;
}

// Интерфейс для параметров экспорта PDF
interface PdfExportParams {
  url?: string;
  debug?: boolean;
  waitTimeout?: number;
  scale?: number;
  format?: string;
  landscape?: boolean;
  expandAll?: boolean;
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({ className }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoadingDebugInfo, setIsLoadingDebugInfo] = useState(false);
  const [showPdfTester, setShowPdfTester] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [detailedDebugInfo, setDetailedDebugInfo] = useState<any>(null);
  
  // Функция для проверки статуса сервера
  const checkServerStatus = async () => {
    try {
      console.log('Проверка статуса PDF сервера...');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/pdf/status`, 
        {
          timeout: 10000, // Увеличиваем таймаут до 10 секунд
          headers: { 'Cache-Control': 'no-cache' } // Отключаем кеширование
        }
      );
      console.log('Статус сервера:', response.data);
      return true;
    } catch (err) {
      console.error('Ошибка при проверке статуса сервера:', err);
      if (axios.isAxiosError(err)) {
        console.error('Детали ошибки Axios:', {
          url: err.config?.url,
          method: err.config?.method,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        });
      }
      return false;
    }
  };
  
  // Функция для копирования всех стилей из текущего документа
  const getAllStyles = () => {
    // Получаем все таблицы стилей из документа
    const styleSheets = document.styleSheets;
    let cssText = '';
    
    // Обрабатываем каждую таблицу стилей
    for (let i = 0; i < styleSheets.length; i++) {
      try {
        const styleSheet = styleSheets[i];
        
        // Пропускаем внешние таблицы стилей из-за CORS ограничений
        if (styleSheet.href && !styleSheet.href.startsWith(window.location.origin)) {
          // Для внешних стилей добавляем ссылку вместо содержимого
          cssText += `@import url("${styleSheet.href}");\n`;
          continue;
        }
        
        // Получаем правила CSS из таблицы стилей
        const rules = styleSheet.cssRules || styleSheet.rules;
        
        for (let j = 0; j < rules.length; j++) {
          cssText += rules[j].cssText + '\n';
        }
      } catch (e) {
        console.warn('Не удалось получить правила из таблицы стилей:', e);
      }
    }
    
    // Добавляем специальные стили для печати и экспорта
    cssText += `
      @media print, screen {
        @page {
          size: A4;
          margin: 2cm;
        }
        body {
          font-size: 8pt;
          background: white !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Оптимизация для масштаба 40% - уменьшаем все размеры */
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Масштабирование компонентов */
        .cycle-component, .group-component, .subgroup-component {
          margin: 0.3em 0 !important;
          padding: 0.3em !important;
          border: 1px solid #e5e7eb;
          border-radius: 0.3em;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        
        /* Оптимизированные размеры шрифтов */
        h1 { font-size: 14pt !important; }
        h2 { font-size: 12pt !important; margin: 4px 0 !important; color: #1e40af; }
        h3 { font-size: 10pt !important; margin: 3px 0 !important; color: #1e40af; }
        h4 { font-size: 9pt !important; margin: 2px 0 !important; color: #1e40af; }
        
        /* Дополнительная оптимизация таблиц */
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 0.5em 0 !important;
          page-break-inside: auto !important;
          font-size: 8pt !important;
        }
        
        tr {
          page-break-inside: avoid !important;
          page-break-after: auto !important;
        }
        
        thead {
          display: table-header-group !important;
        }
        
        tfoot {
          display: table-footer-group !important;
        }
        
        td, th {
          padding: 3px !important;
          border: 1px solid #e5e7eb;
          text-align: left;
        }
        
        th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        
        /* Сохранение цветов фона и градиентов */
        div, span, p, h1, h2, h3, h4, h5, h6, li, td, th {
          color-adjust: exact !important;
        }
        
        /* Корректные разрывы страниц */
        .cycle-component, .group-component, .subgroup-component {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        
        /* Принудительное отображение подгрупп и их контента */
        .subgroup-component {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
        }
        
        /* Принудительное отображение содержимого подгрупп */
        .subgroup-component > div:nth-child(2),
        .subgroup-component .p-3.bg-gray-50.rounded-b-lg.border-t {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
        }
        
        /* Скрываем элементы управления */
        header, footer, button, [role="button"], .search-container, input[type="button"] {
          display: none !important;
        }
        
        /* Устанавливаем ширину контейнера */
        main {
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
        }
        
        /* Фиксируем отображение градиентов и анимаций */
        [style*="background"], [class*="bg-"] {
          -webkit-print-color-adjust: exact !important;
          background-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        /* Отключаем анимации */
        * {
          animation: none !important;
          transition: none !important;
        }
        
        /* Определяем поведение шрифтов */
        @font-face {
          font-display: swap !important;
        }
        
        /* Стили для списков */
        ul, ol {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }
        
        /* Стили для ссылок */
        a {
          color: #2563eb;
          text-decoration: none;
        }
        
        /* Стили для кода */
        code {
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-family: monospace;
        }
        
        /* Стили для предварительно отформатированного текста */
        pre {
          background-color: #f3f4f6;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        
        /* Стили для блоков с кодом */
        pre code {
          background-color: transparent;
          padding: 0;
        }
        
        /* Стили для изображений */
        img {
          max-width: 100%;
          height: auto;
          page-break-inside: avoid;
        }
        
        /* Стили для параграфов */
        p {
          margin: 0.5em 0;
        }
        
        /* Стили для блоков с медикаментами */
        .medications-list {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }
      }
    `;
    
    return cssText;
  };
  
  // Функция для получения всех используемых шрифтов
  const getAllFonts = () => {
    // Собираем ссылки на внешние шрифты
    const fontLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .filter(link => {
        const href = link.getAttribute('href');
        return href?.includes('fonts.googleapis.com') || 
               href?.includes('font') || 
               href?.includes('Font') ||
               href?.includes('.woff') ||
               href?.includes('.ttf');
      });
    
    // Собираем внутренние стили, которые могут содержать @font-face
    const internalStyles = Array.from(document.querySelectorAll('style'))
      .filter(style => style.textContent?.includes('@font-face'));
    
    // Формируем HTML для вставки
    let result = fontLinks.map(link => link.outerHTML).join('\n');
    result += internalStyles.map(style => style.outerHTML).join('\n');
    
    // Добавляем шрифт Inter как запасной вариант
    result += `
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    `;
    
    return result;
  };
  
  // Функция для клонирования DOM с сохранением атрибутов и стилей
  const cloneElementWithStyles = (sourceElement: Element): Element => {
    const clone = sourceElement.cloneNode(true) as Element;
    
    // Функция для обработки элемента с вычисленными стилями
    const processElementStyles = (original: Element, cloned: Element) => {
      // Получаем вычисленные стили
      const computedStyle = window.getComputedStyle(original);
      
      // Применяем важные стили напрямую к элементу
      const importantStyles = [
        'color', 'background-color', 'background-image', 'font-family', 'font-size', 
        'font-weight', 'border', 'border-radius', 'margin', 'padding', 'display', 
        'flex-direction', 'justify-content', 'align-items', 'text-align', 'width', 
        'height', 'max-width', 'min-width', 'max-height', 'min-height', 'table-layout',
        'border-collapse', 'border-spacing', 'vertical-align'
      ];
      
      importantStyles.forEach(style => {
        const value = computedStyle.getPropertyValue(style);
        if (value) {
          (cloned as HTMLElement).style[style as any] = value;
        }
      });
      
      // Сохраняем градиенты и фоновые изображения
      if (computedStyle.backgroundImage && computedStyle.backgroundImage !== 'none') {
        (cloned as HTMLElement).style.backgroundImage = computedStyle.backgroundImage;
      }
      
      // Специальная обработка для таблиц
      if (original instanceof HTMLTableElement) {
        const tableClone = cloned as HTMLTableElement;
        const originalTable = original as HTMLTableElement;
        
        // Копируем атрибуты таблицы
        tableClone.cellPadding = originalTable.cellPadding;
        tableClone.cellSpacing = originalTable.cellSpacing;
        tableClone.width = originalTable.width;
        
        // Копируем стили для ячеек
        const originalCells = originalTable.getElementsByTagName('td');
        const clonedCells = tableClone.getElementsByTagName('td');
        
        for (let i = 0; i < originalCells.length; i++) {
          if (clonedCells[i]) {
            const cellStyle = window.getComputedStyle(originalCells[i]);
            clonedCells[i].style.cssText = cellStyle.cssText;
          }
        }
      }
      
      // Рекурсивно обрабатываем дочерние элементы
      const originalChildren = original.children;
      const clonedChildren = cloned.children;
      
      for (let i = 0; i < originalChildren.length; i++) {
        if (clonedChildren[i]) {
          processElementStyles(originalChildren[i], clonedChildren[i]);
        }
      }
    };
    
    // Применяем стили к клонированному элементу
    processElementStyles(sourceElement, clone);
    
    return clone;
  };
  
  // Функция для прямого экспорта HTML-страницы
  const directHtmlExport = () => {
    // Открываем новое окно
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Не удалось открыть окно для печати');
    }
    
    // Получаем основной контент
    const mainContent = document.querySelector('main');
    if (!mainContent) {
      throw new Error('Не найден контент для экспорта');
    }
    
    // Получаем все циклы и таблицы
    const cycleComponents = document.querySelectorAll('.cycle-component');
    const tableContainers = document.querySelectorAll('table, .table-container, .TableComponent');
    
    console.log('Найдено циклов:', cycleComponents.length);
    console.log('Найдено таблиц:', tableContainers.length);
    
    // Создаем клон всего содержимого main для обработки
    const contentClone = mainContent.cloneNode(true) as HTMLElement;
    
    // Показываем все скрытые элементы в клоне
    contentClone.querySelectorAll('[aria-hidden="true"]').forEach((el) => {
      (el as HTMLElement).setAttribute('aria-hidden', 'false');
      (el as HTMLElement).style.display = (el as HTMLElement).tagName.toLowerCase() === 'table' ? 'table' : 'block';
    });
    
    // Раскрываем все свернутые элементы в клоне
    contentClone.querySelectorAll('[aria-expanded="false"]').forEach((el) => {
      el.setAttribute('aria-expanded', 'true');
      
      // Находим соответствующее содержимое и показываем его
      const content = el.parentElement?.querySelector('[aria-hidden="true"]');
      if (content instanceof HTMLElement) {
        content.setAttribute('aria-hidden', 'false');
        content.style.display = 'block';
      }
    });
    
    // Скрываем кнопки и другие элементы управления
    contentClone.querySelectorAll('button, [role="button"], .search-container, input[type="button"], .btn, .icon-button, .actions').forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });
    
    // Получаем заголовок страницы
    let pageTitle = 'Классификация лекарственных средств';
    const titleElement = document.querySelector('h1');
    if (titleElement) {
      pageTitle = titleElement.textContent || pageTitle;
    }
    
    // Получаем все стили и шрифты
    const allStyles = getAllStyles();
    const allFonts = getAllFonts();
    
    // Создаем новый документ с чистой структурой
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${pageTitle}</title>
        
        <!-- Подключаем шрифты -->
        ${allFonts}
        
        <!-- Основные стили для экспорта -->
        <style>
          /* Базовые стили для контейнера */
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0; 
            padding: 30px;
            background-color: white;
            color: #111827;
            line-height: 1.5;
            width: 100%;
            box-sizing: border-box;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          /* Скрываем все кнопки и элементы управления при печати */
          @media print {
            button, 
            [role="button"], 
            .icon-button, 
            .actions,
            input[type="button"],
            .action-buttons,
            .control-buttons,
            .edit-controls {
              display: none !important;
              visibility: hidden !important;
            }
          }
          
          /* Заголовок экспорта */
          h1 { 
            text-align: center; 
            margin-bottom: 20px; 
            color: #1e40af;
            font-weight: 700;
            font-size: 24px;
          }
          
          /* Шапка документа */
          .export-header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
          }
          .export-header .org {
            color: #4b5563;
            margin-bottom: 5px;
            font-size: 16px;
          }
          .export-header .department {
            color: #6b7280;
            font-size: 14px;
          }
          
          /* Основной контент */
          .export-content {
            margin: 30px 0;
          }
          
          /* Подвал документа */
          .export-footer { 
            text-align: center; 
            margin-top: 50px; 
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          
          /* Циклы */
          .cycle-component {
            margin-bottom: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .cycle-header {
            padding: 15px;
            background-color: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .cycle-content {
            padding: 15px;
          }
          
          /* Группы */
          .group-component {
            margin: 15px 0;
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
          
          /* Таблицы */
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            display: table !important;
          }
          
          th, td {
            border: 1px solid #e5e7eb;
            padding: 8px 12px;
            text-align: left;
          }
          
          th {
            background-color: #f3f4f6;
            font-weight: 600;
          }
          
          tr {
            display: table-row !important;
          }
          
          td, th {
            display: table-cell !important;
          }
          
          /* Скрываем кнопки и элементы управления */
          button, 
          [role="button"], 
          .search-container,
          input[type="button"],
          .btn,
          .icon-button,
          .actions {
            display: none !important;
          }
          
          /* Отображаем скрытые элементы */
          [aria-hidden="true"] {
            display: block !important;
          }
          
          /* Гарантируем видимость всех важных элементов */
          .cycle-component, .group-component, .subgroup-component,
          .medications-list, .description, .table-component, table {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          /* Дополнительные стили из приложения */
          ${allStyles}
          
          /* Специальные стили для печати */
          @media print {
            @page {
              size: A4;
              margin: 2cm;
            }
            body {
              font-size: 12pt;
              background: white !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body class="export-body">
        <div class="export-header">
          <h1>${pageTitle}</h1>
          <div class="org">ФГБОУ ВО ОрГМУ Минздрава России</div>
          <div class="department">Кафедра фармакологии</div>
        </div>
        
        <div class="export-content" id="export-content">
          <!-- Здесь будет контент для экспорта -->
        </div>
        
        <div class="export-footer">
          © ${new Date().getFullYear()} Кафедра фармакологии ОрГМУ. Все права защищены.
        </div>
        
        <script>
          // Отладочная информация
          console.log('Экспорт запущен');
          console.log('Контент:', document.getElementById('export-content').children.length);
          
          // Функция для раскрытия всех скрытых элементов
          function expandAllElements() {
            console.log('Раскрываем все элементы для экспорта...');
            
            // Показываем все скрытые таблицы
            document.querySelectorAll('table[aria-hidden="true"]').forEach(function(table) {
              table.setAttribute('aria-hidden', 'false');
              table.style.display = 'table';
            });
            
            // Показываем все скрытые ячейки
            document.querySelectorAll('td[aria-hidden="true"], th[aria-hidden="true"]').forEach(function(cell) {
              cell.setAttribute('aria-hidden', 'false');
              cell.style.display = 'table-cell';
            });
            
            // Показываем все строки таблицы
            document.querySelectorAll('tr[aria-hidden="true"]').forEach(function(row) {
              row.setAttribute('aria-hidden', 'false');
              row.style.display = 'table-row';
            });
            
            // Кликаем по всем возможным вкладкам
            const tabSelectors = [
              '[role="tab"]',
              '.tabs-item',
              '.tab',
              '.tab-button',
              '[data-tab]',
              'button.nav-link',
              '.cycle-header',
              '.group-header',
              '.accordion-button',
              '.accordion-header button'
            ];
            
            tabSelectors.forEach(function(selector) {
              document.querySelectorAll(selector).forEach(function(tab) {
                try {
                  console.log('Клик по элементу:', tab.textContent || 'без текста');
                  tab.click();
                } catch(err) {
                  console.log('Ошибка при клике:', err);
                }
              });
            });
            
            // Устанавливаем атрибут aria-expanded="true" для всех сворачиваемых элементов
            document.querySelectorAll('[aria-expanded="false"]').forEach(function(el) {
              el.setAttribute('aria-expanded', 'true');
              if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') {
                try {
                  el.click();
                } catch(err) {}
              }
            });
            
            // Делаем видимыми все скрытые элементы
            document.querySelectorAll('[aria-hidden="true"]').forEach(function(el) {
              el.setAttribute('aria-hidden', 'false');
              el.style.display = 'block';
            });
            
            // Раскрываем все компоненты с классами hidden и collapsed
            document.querySelectorAll('.collapsed, .hidden, .invisible, .collapse:not(.show)').forEach(function(el) {
              el.classList.remove('collapsed', 'hidden', 'invisible');
              el.classList.add('show');
              el.style.display = 'block';
              el.style.visibility = 'visible';
              el.style.opacity = '1';
            });
            
            // Специальная обработка для подгрупп - принудительное раскрытие
            document.querySelectorAll('.subgroup-component').forEach(function(subgroup) {
              // Устанавливаем стили для отображения всей подгруппы
              subgroup.style.display = 'block';
              subgroup.style.visibility = 'visible';
              subgroup.style.opacity = '1';
              subgroup.style.height = 'auto';
              subgroup.style.maxHeight = 'none';
              
              // Находим контент подгруппы (обычно второй div или элемент с определенным классом)
              const subgroupContent = subgroup.querySelector('.p-3.bg-gray-50.rounded-b-lg.border-t');
              if (subgroupContent) {
                // Принудительно отображаем контент подгруппы
                subgroupContent.style.display = 'block';
                subgroupContent.style.visibility = 'visible';
                subgroupContent.style.opacity = '1';
                subgroupContent.style.height = 'auto';
                subgroupContent.style.maxHeight = 'none';
                
                // Находим все вложенные элементы и делаем их видимыми
                subgroupContent.querySelectorAll('*').forEach(function(el) {
                  if (el.tagName === 'TABLE') {
                    el.style.display = 'table'; 
                  } else if (el.tagName === 'TR') {
                    el.style.display = 'table-row';
                  } else if (el.tagName === 'TD' || el.tagName === 'TH') {
                    el.style.display = 'table-cell';
                  } else {
                    el.style.display = 'block';
                  }
                  el.style.visibility = 'visible';
                  el.style.opacity = '1';
                });
              }
            });
            
            // Показываем все циклы и группы
            ['cycle-component', 'group-component', 'subgroup-component'].forEach(function(className) {
              document.querySelectorAll('.' + className).forEach(function(component) {
                component.style.display = 'block';
                component.style.visibility = 'visible';
              });
            });
            
            // Раскрываем табы с tab-pane
            document.querySelectorAll('.tab-pane').forEach(function(tab) {
              tab.classList.add('active', 'show');
              tab.style.display = 'block';
            });
            
            console.log('Раскрытие элементов завершено');
          }
          
          // Автоматически запускаем печать после загрузки
          window.onload = function() {
            console.log('Страница загружена, начинаем подготовку к печати');
            
            // Первый проход раскрытия элементов
            expandAllElements();
            
            // Второй проход через небольшую задержку
            setTimeout(function() {
              expandAllElements();
              
              // Запускаем печать с задержкой для полного раскрытия всех элементов
              setTimeout(function() {
                console.log('Подготовка к печати завершена');
                window.print();
              }, 1000);
            }, 500);
          };
        </script>
      </body>
      </html>
    `);
    
    // Находим контейнер для содержимого
    const exportContainer = printWindow.document.getElementById('export-content');
    if (!exportContainer) {
      throw new Error('Не удалось найти контейнер для экспорта');
    }
    
    // Прямая вставка обработанного клона контента
    exportContainer.appendChild(printWindow.document.importNode(contentClone, true));
    
    // Дополнительно проверяем, есть ли таблицы в экспорте
    if (printWindow.document.querySelectorAll('table').length === 0) {
      console.warn('В экспорте не найдено таблиц, пробуем альтернативный метод');
      
      // Если таблиц нет, пробуем найти и добавить их напрямую
      const tables = document.querySelectorAll('table');
      if (tables.length > 0) {
        // Добавляем предупреждение
        const warning = printWindow.document.createElement('div');
        warning.style.padding = '10px';
        warning.style.margin = '20px 0';
        warning.style.backgroundColor = '#fff9db';
        warning.style.border = '1px solid #f59f00';
        warning.style.borderRadius = '4px';
        warning.textContent = 'Таблицы добавлены отдельно:';
        exportContainer.appendChild(warning);
        
        // Добавляем каждую таблицу отдельно
        tables.forEach(table => {
          const tableClone = table.cloneNode(true);
          exportContainer.appendChild(printWindow.document.importNode(tableClone, true));
        });
      }
    }
    
    // Завершаем загрузку документа
    printWindow.document.close();
    printWindow.focus();
  };
  
  // Новая функция для серверного экспорта PDF через Puppeteer
  const serverPdfExport = async (customParams: PdfExportParams = {}) => {
    try {
      console.log('Запуск серверного экспорта PDF через Puppeteer');
      
      // Убираем строгую проверку и добавляем логирование
      const cycleComponents = document.querySelectorAll('.cycle-component').length;
      const tableComponents = document.querySelectorAll('table').length;
      const mainContent = document.querySelector('main');
      
      console.log(`Найдено элементов для экспорта: циклы - ${cycleComponents}, таблицы - ${tableComponents}`);
      
      // Проверка наличия хотя бы основного контейнера
      if (!mainContent) {
        throw new Error('Не найден основной контейнер для экспорта (main)');
      }
      
      // Определяем URL для обработки: текущий URL + print=true
      // Это заставит компоненты перейти в режим печати
      const printUrl = `${window.location.origin}${window.location.pathname}?print=true`;
      console.log('Используем URL для печати:', printUrl);
      
      // Показываем индикатор загрузки для длительных операций
      let loadingIndicator: HTMLDivElement | null = null;
      try {
        loadingIndicator = document.createElement('div');
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.top = '50%';
        loadingIndicator.style.left = '50%';
        loadingIndicator.style.transform = 'translate(-50%, -50%)';
        loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        loadingIndicator.style.color = 'white';
        loadingIndicator.style.padding = '20px 30px';
        loadingIndicator.style.borderRadius = '8px';
        loadingIndicator.style.zIndex = '9999';
        loadingIndicator.style.display = 'flex';
        loadingIndicator.style.flexDirection = 'column';
        loadingIndicator.style.alignItems = 'center';
        loadingIndicator.style.gap = '10px';
        loadingIndicator.innerHTML = `
          <div style="width: 30px; height: 30px; border: 3px solid #fff; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
          <div>Генерация PDF...</div>
          <div style="font-size: 12px; opacity: 0.8;">Это может занять несколько секунд</div>
        `;
        
        // Добавляем стиль анимации
        const style = document.createElement('style');
        style.innerHTML = `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
        document.body.appendChild(loadingIndicator);
      } catch (e) {
        console.warn('Не удалось создать индикатор загрузки', e);
      }
      
      // Проверяем доступность сервера непосредственно перед отправкой запроса
      const serverUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}`;
      try {
        console.log(`Проверка доступности сервера ${serverUrl}...`);
        const statusResponse = await axios.get(`${serverUrl}/api/pdf/status`, { 
          timeout: 5000,
          headers: { 'Cache-Control': 'no-cache' }
        });
        console.log('Статус сервера перед экспортом:', statusResponse.data);
      } catch (statusError) {
        console.error('Ошибка при проверке статуса сервера:', statusError);
        throw new Error('Сервер PDF недоступен. Убедитесь, что сервер запущен и работает на порту 5001.');
      }
      
      // Отправляем запрос на серверный API с повышенным таймаутом
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 минуты таймаут
      
      try {
        console.log('Отправка запроса на генерацию PDF:', printUrl);
        
        // Объединяем параметры по умолчанию с пользовательскими
        const requestParams = { 
          url: printUrl,
          debug: customParams.debug || false,
          waitTimeout: customParams.waitTimeout || 10000,
          scale: customParams.scale || 0.375, // Уменьшено в 2 раза с 0.75
          format: customParams.format || "a4",
          landscape: customParams.landscape || false
        };
        
        console.log('Параметры запроса:', requestParams);
        
        const response = await axios({
          method: 'POST',
          url: `${serverUrl}/api/pdf/generate-pdf`,
          data: requestParams,
          responseType: 'blob', // Важно для получения бинарных данных
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          timeout: 180000, // 3 минуты таймаут
          signal: controller.signal,
          maxContentLength: 50 * 1024 * 1024, // 50MB максимальный размер ответа
          maxBodyLength: 50 * 1024 * 1024, // 50MB максимальный размер тела запроса
        });
        
        clearTimeout(timeoutId);
        
        // Проверяем успешность запроса
        if (response.status !== 200) {
          throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
        }
        
        // Получаем данные PDF
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        
        // Проверяем размер PDF (должен быть более 1 КБ)
        if (pdfBlob.size < 1024) {
          throw new Error('Сгенерирован пустой или некорректный PDF');
        }
        
        // Создаем URL для скачивания
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // Создаем ссылку для скачивания и активируем её
        const downloadLink = document.createElement('a');
        downloadLink.href = pdfUrl;
        downloadLink.download = 'классификация-лс.pdf';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Удаляем ссылку и освобождаем URL
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(pdfUrl);
        }, 100);
        
        console.log('PDF успешно создан и скачан');
        return true;
      } catch (error) {
        clearTimeout(timeoutId);
        
        console.error('Ошибка при серверном экспорте PDF:', error);
        
        // Если это ошибка прерывания запроса пользователем, то показываем соответствующее сообщение
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new Error('Экспорт PDF был отменен из-за длительного ожидания (более 3 минут)');
        }
        
        // Детальный анализ ошибок Axios
        if (axios.isAxiosError(error)) {
          console.error('Детали ошибки Axios:', {
            config: error.config,
            code: error.code,
            message: error.message,
            response: error.response?.data
          });
          
          // Проверка типа ошибки
          if (error.code === 'ECONNABORTED') {
            throw new Error('Время ожидания ответа от сервера истекло. Возможно, генерация PDF занимает слишком много времени.');
          } else if (error.code === 'ERR_NETWORK' || !error.response) {
            throw new Error('Не удалось подключиться к серверу PDF. Проверьте, запущен ли сервер на порту 5001.');
          } else if (error.response?.status === 413) {
            throw new Error('PDF слишком большой. Попробуйте уменьшить масштаб или экспортировать меньший раздел.');
          } else if (error.response?.status >= 400 && error.response?.status < 500) {
            throw new Error(`Ошибка клиента: ${error.response.status} ${error.response.statusText}`);
          } else if (error.response?.status >= 500) {
            throw new Error(`Ошибка сервера: ${error.response.status} ${error.response.statusText}`);
          }
        }
        
        // Если не удалось определить конкретную ошибку
        throw error;
      } finally {
        // Удаляем индикатор загрузки
        if (loadingIndicator && loadingIndicator.parentNode) {
          loadingIndicator.parentNode.removeChild(loadingIndicator);
        }
      }
    } catch (error) {
      console.error('Ошибка при серверном экспорте PDF:', error);
      
      // Проброс ошибки для обработки в вызывающем коде
      throw error instanceof Error ? error : new Error(String(error));
    }
  };
  
  // Функция для получения отладочной информации с сервера
  const fetchDebugInfo = async () => {
    setIsLoadingDebugInfo(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/pdf/status`);
      setDebugInfo(response.data);
      return response.data;
    } catch (err) {
      console.error('Ошибка при получении отладочной информации:', err);
      setError(`Не удалось получить отладочную информацию: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      return null;
    } finally {
      setIsLoadingDebugInfo(false);
    }
  };
  
  // Функция для получения расширенной отладочной информации
  const fetchDetailedDebugInfo = async () => {
    setIsLoadingDebugInfo(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/pdf/debug-info`);
      setDetailedDebugInfo(response.data);
      return response.data;
    } catch (err) {
      console.error('Ошибка при получении расширенной отладочной информации:', err);
      setError(`Не удалось получить расширенную отладочную информацию: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      return null;
    } finally {
      setIsLoadingDebugInfo(false);
    }
  };
  
  // Функция для просмотра отладочного файла
  const viewDebugFile = (filename: string) => {
    const fileUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/pdf/debug-file/${filename}`;
    window.open(fileUrl, '_blank');
  };
  
  // Обработчик отладочного режима
  const handleDebugMode = async () => {
    setShowDebugPanel(!showDebugPanel);
    if (!showDebugPanel && !debugInfo) {
      await fetchDebugInfo();
    }
  };
  
  // Функция для запуска экспорта в режиме отладки
  const handleDebugExport = async () => {
    setError(null);
    
    try {
      setIsExporting(true);
      
      // Получаем URL для печати
      const printUrl = `${window.location.origin}${window.location.pathname}?print=true`;
      
      // Настройки качества PDF
      let qualitySettings = {
        scale: 0.75,
        waitTimeout: 10000
      };
      
      // Применяем настройки в зависимости от выбранного качества
      switch (selectedQuality) {
        case 'low':
          qualitySettings.scale = 0.25;  // Уменьшено в 2 раза с 0.5
          qualitySettings.waitTimeout = 5000;
          break;
        case 'medium':
          qualitySettings.scale = 0.375;  // Уменьшено в 2 раза с 0.75
          qualitySettings.waitTimeout = 10000;
          break;
        case 'high':
          qualitySettings.scale = 0.5;  // Уменьшено в 2 раза с 1.0
          qualitySettings.waitTimeout = 15000;
          break;
      }
      
      // Используем настройки качества для экспорта PDF
      const debugParams: PdfExportParams = {
        url: printUrl,
        debug: true,
        waitTimeout: qualitySettings.waitTimeout,
        scale: qualitySettings.scale,
        format: "a4"
      };
      
      console.log('Запуск отладочного экспорта с параметрами:', debugParams);
      
      // Отправляем запрос на API с включенным режимом отладки
      const response = await axios({
        method: 'POST',
        url: `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/pdf/generate-pdf`,
        data: debugParams,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 секунд таймаут
      });
      
      // Обновляем отладочную информацию после генерации
      await fetchDebugInfo();
      
      setError('Экспорт в режиме отладки выполнен успешно. Проверьте отладочную информацию.');
    } catch (err) {
      console.error('Ошибка при отладочном экспорте:', err);
      let errorMessage = 'Неизвестная ошибка';
      
      if (axios.isAxiosError(err)) {
        // Более детальная обработка ошибок Axios
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'Превышено время ожидания ответа от сервера. Попробуйте уменьшить качество PDF.';
        } else if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Не удалось подключиться к серверу PDF. Проверьте, запущен ли сервер на порту 5001.';
        } else if (err.response) {
          errorMessage = `Ошибка сервера (${err.response.status}): ${
            err.response.data?.error || err.response.statusText || 'Неизвестная ошибка сервера'
          }`;
        } else {
          errorMessage = `Ошибка запроса: ${err.message}`;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(`Ошибка при отладке: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Функция для проверки клиентского рендеринга
  const checkClientRendering = () => {
    try {
      // Получаем и анализируем основные компоненты на странице
      const cycles = document.querySelectorAll('.cycle-component');
      const groups = document.querySelectorAll('.group-component');
      const tables = document.querySelectorAll('table');
      const medications = document.querySelectorAll('.medications-list, .medication-item');
      
      // Собираем статистику
      const stats = {
        cycles: cycles.length,
        groups: groups.length,
        tables: tables.length,
        medications: medications.length,
        bodyHeight: document.body.scrollHeight,
        mainContent: document.querySelector('main')?.scrollHeight || 0,
        visibilityIssues: [] as string[]
      };
      
      // Проверяем видимость элементов
      cycles.forEach((cycle, i) => {
        const style = window.getComputedStyle(cycle as HTMLElement);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          stats.visibilityIssues.push(`Цикл #${i+1} скрыт: display=${style.display}, visibility=${style.visibility}, opacity=${style.opacity}`);
        }
      });
      
      // Проверяем overflow
      document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el as HTMLElement);
        if ((el as HTMLElement).contains(cycles[0]) && 
            (style.overflow === 'hidden' || style.overflowY === 'hidden') && 
            (el as HTMLElement).scrollHeight > (el as HTMLElement).clientHeight) {
          stats.visibilityIssues.push(`Контейнер с overflow:hidden обрезает контент: ${el.tagName}.${el.className}`);
        }
      });
      
      // Открываем новое окно с отчетом
      const reportWindow = window.open('', '_blank');
      if (!reportWindow) {
        throw new Error('Не удалось открыть окно для отчета');
      }
      
      // Формируем HTML-отчет
      reportWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Анализ рендеринга</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            h1 { color: #2563eb; }
            h2 { color: #4b5563; margin-top: 20px; }
            .section { border: 1px solid #e5e7eb; padding: 15px; margin: 15px 0; border-radius: 8px; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
            .stat-item { background: #f3f4f6; padding: 10px; border-radius: 4px; }
            .issue { color: #ef4444; margin: 10px 0; }
            .warning { color: #f59e0b; }
            .info { color: #3b82f6; }
            .success { color: #10b981; }
            button { padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #1d4ed8; }
            pre { background: #f3f4f6; padding: 15px; border-radius: 4px; overflow: auto; }
          </style>
        </head>
        <body>
          <h1>Анализ клиентского рендеринга</h1>
          
          <div class="section">
            <h2>Статистика элементов</h2>
            <div class="stats-grid">
              <div class="stat-item">
                <div>Циклы:</div>
                <strong>${stats.cycles}</strong>
              </div>
              <div class="stat-item">
                <div>Группы:</div>
                <strong>${stats.groups}</strong>
              </div>
              <div class="stat-item">
                <div>Таблицы:</div>
                <strong>${stats.tables}</strong>
              </div>
              <div class="stat-item">
                <div>Медикаменты:</div>
                <strong>${stats.medications}</strong>
              </div>
              <div class="stat-item">
                <div>Высота body:</div>
                <strong>${stats.bodyHeight}px</strong>
              </div>
              <div class="stat-item">
                <div>Высота main:</div>
                <strong>${stats.mainContent}px</strong>
              </div>
            </div>
          </div>
          
          ${stats.visibilityIssues.length > 0 ? `
            <div class="section">
              <h2>Проблемы с видимостью</h2>
              ${stats.visibilityIssues.map(issue => `<div class="issue">⚠️ ${issue}</div>`).join('')}
            </div>
          ` : `
            <div class="section">
              <h2>Проблемы с видимостью</h2>
              <div class="success">✅ Проблем с видимостью не обнаружено</div>
            </div>
          `}
          
          <div class="section">
            <h2>Проверка URL для печати</h2>
            <p>
              Для тестирования страницы в режиме печати, откройте следующий URL:
            </p>
            <pre>${window.location.origin}${window.location.pathname}?print=true</pre>
            <p>
              <button onclick="window.open('${window.location.origin}${window.location.pathname}?print=true', '_blank')">
                Открыть в новом окне
              </button>
            </p>
          </div>
          
          <div class="section">
            <h2>Рекомендации</h2>
            <ul>
              <li>Проверьте правильность отображения всех циклов и групп в открытом состоянии</li>
              <li>Убедитесь, что нет контейнеров с <code>overflow: hidden</code>, которые обрезают контент</li>
              <li>Проверьте, что все элементы видимы (нет <code>display: none</code> или <code>visibility: hidden</code>)</li>
              <li>Проверьте отображение страницы в режиме печати (ссылка выше)</li>
            </ul>
          </div>
        </body>
        </html>
      `);
      
      reportWindow.document.close();
      reportWindow.focus();
      
      return stats;
    } catch (error) {
      console.error('Ошибка при анализе клиентского рендеринга:', error);
      setError(`Ошибка анализа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return null;
    }
  };
  
  // Обработчик экспорта PDF
  const handleExport = async () => {
    setError(null);
    setIsExporting(true);

    try {
      // Проверяем статус сервера перед экспортом
      const serverIsAvailable = await checkServerStatus();
      
      if (!serverIsAvailable) {
        console.log('Сервер PDF недоступен, используем клиентский метод генерации PDF');
        await clientPdfExport();
        return;
      }
      
      console.log('Сервер PDF доступен, начинаем экспорт...');
      
      try {
        // Пытаемся выполнить серверный экспорт с настройками по умолчанию
        // Создаем объект с параметрами по умолчанию
        const defaultParams: PdfExportParams = {
          scale: 0.375, // Уменьшено в 2 раза с 0.75
          waitTimeout: 10000,
          format: "a4",
          landscape: false,
          debug: false
        };
        
        await serverPdfExport(defaultParams);
      } catch (err) {
        console.warn('Серверный экспорт PDF не удался, используем клиентский метод', err);
        // Если серверный метод не сработал, используем клиентский
        await clientPdfExport();
      }
    } catch (err) {
      console.error('Ошибка при экспорте PDF:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка при экспорте PDF');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Новый метод для клиентской генерации PDF (используя печать браузера)
  const clientPdfExport = async () => {
    console.log('Запуск клиентского метода экспорта PDF...');
    
    // Открываем в новом окне с параметром печати
    const printUrl = `${window.location.origin}${window.location.pathname}?print=true`;
    const printWindow = window.open(printUrl, '_blank');
    
    if (!printWindow) {
      throw new Error('Не удалось открыть окно печати. Возможно, заблокированы всплывающие окна.');
    }
    
    // Когда окно загрузится, запускаем печать
    printWindow.addEventListener('load', () => {
      setTimeout(() => {
        printWindow.print();
        // Не закрываем окно, чтобы пользователь мог сохранить PDF
      }, 1000);
    });
    
    return true;
  };
  
  // Дополнительный компонент для тестирования различных параметров PDF
  const PDFGenerationTester: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [params, setParams] = useState<PdfExportParams>({
      waitTimeout: 5000,
      scale: 0.75,
      debug: false,
      landscape: false
    });
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    
    const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setParams(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
      }));
    };
    
    const startTest = async () => {
      setIsRunning(true);
      
      // Объявляем переменную originalCreateElement за пределами блока try
      const originalCreateElement = document.createElement;
      
      try {
        // Используем функцию serverPdfExport с текущими параметрами
        console.log('Запуск тестирования с параметрами:', params);
        
        // Получаем URL для печати
        const printUrl = `${window.location.origin}${window.location.pathname}?print=true`;
        
        // Проверяем доступность сервера перед запуском экспорта
        try {
          console.log('Проверка доступности сервера PDF...');
          const isAvailable = await checkServerStatus();
          if (!isAvailable) {
            throw new Error('Сервер PDF недоступен. Проверьте, запущен ли сервер на порту 5001.');
          }
          console.log('Сервер PDF доступен, продолжаем тестирование...');
        } catch (error) {
          console.error('Ошибка при проверке сервера:', error);
          throw new Error('Не удалось подключиться к серверу PDF. Проверьте, запущен ли сервер на порту 5001.');
        }
        
        // Замеряем время выполнения
        const startTime = new Date().getTime();
        
        // Используем существующую функцию serverPdfExport
        // Создаем временный обработчик для сохранения результата теста
        document.createElement = function(tagName: string) {
          const element = originalCreateElement.call(document, tagName);
          if (tagName.toLowerCase() === 'a' && element instanceof HTMLAnchorElement) {
            // Переопределяем клик, чтобы сохранить результат вместо скачивания
            const originalClick = element.click;
            element.click = async function() {
              try {
                // Сохраняем результат теста вместо скачивания
                const endTime = new Date().getTime();
                
                // Получаем blob из URL
                const resp = await fetch(this.href);
                const pdfBlob = await resp.blob();
                
                // Получаем размер PDF в KB
                const pdfSize = Math.round(pdfBlob.size / 1024);
                
                // Получаем статус сервера для отладочной информации
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
                const statusResponse = await axios.get(`${apiUrl}/pdf/status`);
                const debugInfo = statusResponse.data.debugInfo || {};
                
                // Сохраняем результат теста
                setResults(prev => [...prev, {
                  id: Date.now(),
                  params: { ...params },
                  pdfUrl: this.href,
                  pdfSize,
                  processingTime: endTime - startTime,
                  serverInfo: debugInfo.lastPdfGeneration || {}
                }]);
                
                // Не вызываем оригинальный click, чтобы предотвратить скачивание
              } catch (error) {
                console.error('Ошибка при сохранении результата теста:', error);
              } finally {
                // Восстанавливаем оригинальную функцию
                document.createElement = originalCreateElement;
              }
            };
          }
          return element;
        };
        
        // Выполняем экспорт через нашу существующую функцию
        try {
          console.log('Запуск серверного экспорта PDF с параметрами:', params);
          await serverPdfExport(params);
          console.log('Серверный экспорт PDF успешно завершен');
        } catch (error) {
          console.error('Ошибка при серверном экспорте PDF:', error);
          throw error; // Пробрасываем ошибку для отображения в интерфейсе
        }
        
        // Восстанавливаем оригинальную функцию
        document.createElement = originalCreateElement;
      } catch (error) {
        console.error('Ошибка при тестировании PDF:', error);
        alert(`Ошибка при тестировании PDF: ${error instanceof Error ? error.message : String(error)}`);
        
        // Восстанавливаем оригинальную функцию
        document.createElement = originalCreateElement;
      } finally {
        setIsRunning(false);
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl p-6 w-4/5 h-4/5 overflow-auto" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Тестирование параметров генерации PDF</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-4">Параметры</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1">Время ожидания загрузки (мс)</label>
                  <input 
                    type="number" 
                    value={params.waitTimeout}
                    onChange={handleParamChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block mb-1">Масштаб (0.5 - 2.0)</label>
                  <input 
                    type="number" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1"
                    name="scale"
                    value={params.scale}
                    onChange={handleParamChange}
                    className="w-full p-2 border rounded"
                  />
                  <div className="text-xs text-gray-500 mt-1">По умолчанию: 0.75 (масштаб 75%)</div>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="debug-mode" 
                    checked={params.debug}
                    onChange={handleParamChange}
                    className="mr-2"
                  />
                  <label htmlFor="debug-mode">Режим отладки</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="landscape" 
                    checked={params.landscape}
                    onChange={handleParamChange}
                    className="mr-2"
                  />
                  <label htmlFor="landscape">Альбомная ориентация</label>
                </div>
                
                <button
                  onClick={startTest}
                  disabled={isRunning}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isRunning ? 'Генерация...' : 'Тестировать параметры'}
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Результаты ({results.length})</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {results.length === 0 ? (
                  <div className="text-gray-500">Нет результатов. Запустите тест с разными параметрами.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {results.map((result, idx) => (
                      <div key={result.id || idx} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="bg-gray-100 p-3 border-b">
                          <div className="font-medium">Тест #{idx + 1}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(result.id || Date.now()).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="font-semibold mb-1">Параметры:</div>
                          <div>Таймаут: {result.params.waitTimeout}мс</div>
                          <div>Масштаб: {result.params.scale}</div>
                          <div>Отладка: {result.params.debug ? 'Да' : 'Нет'}</div>
                          <div>Альбомная: {result.params.landscape ? 'Да' : 'Нет'}</div>
                          {result.serverInfo && (
                            <div className="mt-2 text-xs text-gray-600">
                              <div className="font-semibold">Информация сервера:</div>
                              <div>Размер PDF: {result.pdfSize} KB</div>
                              <div>Время генерации: {result.processingTime || result.serverInfo.processingTime || 'N/A'} мс</div>
                              {result.serverInfo.contentStats && (
                                <>
                                  <div className="font-semibold mt-1">Контент:</div>
                                  <div>Циклы: {result.serverInfo.contentStats.cycles ? 
                                    `${result.serverInfo.contentStats.cycles.total} (видимых: ${result.serverInfo.contentStats.cycles.visible})` :
                                    result.serverInfo.contentStats.cyclesCount || 'N/A'}</div>
                                  <div>Группы: {result.serverInfo.contentStats.groups ? 
                                    `${result.serverInfo.contentStats.groups.total} (видимых: ${result.serverInfo.contentStats.groups.visible})` :
                                    result.serverInfo.contentStats.groupsCount || 'N/A'}</div>
                                  <div>Таблицы: {result.serverInfo.contentStats.tables ? 
                                    `${result.serverInfo.contentStats.tables.total} (видимых: ${result.serverInfo.contentStats.tables.visible})` :
                                    result.serverInfo.contentStats.tablesCount || 'N/A'}</div>
                                  {result.serverInfo.contentStats.medications && (
                                    <div>Препараты: {result.serverInfo.contentStats.medications.total} (видимых: {result.serverInfo.contentStats.medications.visible})</div>
                                  )}
                                  {result.serverInfo.contentStats.contentSize && (
                                    <div>Размер контента: {Math.round(result.serverInfo.contentStats.contentSize.width)}×{Math.round(result.serverInfo.contentStats.contentSize.height)}</div>
                                  )}
                                </>
                              )}
                              {result.serverInfo.warnings && result.serverInfo.warnings.length > 0 && (
                                <div className="mt-1 text-amber-600">
                                  <div className="font-semibold">Предупреждения:</div>
                                  <ul className="list-disc list-inside">
                                    {result.serverInfo.warnings.map((warning: string, i: number) => (
                                      <li key={i}>{warning}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {result.serverInfo.error && (
                                <div className="mt-1 text-red-600">
                                  <div className="font-semibold">Ошибка:</div>
                                  <div>{result.serverInfo.error}</div>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="mt-3">
                            <a 
                              href={result.pdfUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-block px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            >
                              Открыть PDF
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Функция для просмотра HTML-версии перед экспортом
  const viewHtmlBeforeExport = () => {
    const printUrl = `${window.location.origin}${window.location.pathname}?print=true`;
    window.open(printUrl, '_blank');
  };
  
  // Рендер отладочной панели
  const renderDebugPanel = () => {
    if (!showDebugPanel) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDebugPanel(false)}>
        <div className="bg-white rounded-lg shadow-xl p-6 w-4/5 h-4/5 overflow-auto" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Отладка экспорта PDF</h2>
            <button onClick={() => setShowDebugPanel(false)} className="text-gray-500 hover:text-gray-800">
              &times;
            </button>
          </div>
          
          <div className="mb-4">
            <div className="font-medium mb-2">Качество экспорта:</div>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedQuality('low')}
                className={`px-3 py-1 rounded-lg border ${selectedQuality === 'low' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-800 border-gray-300'}`}
              >
                Низкое (быстрее)
              </button>
              <button 
                onClick={() => setSelectedQuality('medium')}
                className={`px-3 py-1 rounded-lg border ${selectedQuality === 'medium' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-800 border-gray-300'}`}
              >
                Среднее
              </button>
              <button 
                onClick={() => setSelectedQuality('high')}
                className={`px-3 py-1 rounded-lg border ${selectedQuality === 'high' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-800 border-gray-300'}`}
              >
                Высокое (медленнее)
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <button 
              onClick={handleDebugExport}
              disabled={isExporting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isExporting ? 'Запуск...' : 'Запустить отладочный экспорт'}
            </button>
            
            <button 
              onClick={fetchDebugInfo} 
              disabled={isLoadingDebugInfo}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              {isLoadingDebugInfo ? 'Загрузка...' : 'Обновить информацию'}
            </button>
            
            <button 
              onClick={fetchDetailedDebugInfo}
              disabled={isLoadingDebugInfo}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
            >
              Расширенная отладка
            </button>
            
            <button 
              onClick={checkClientRendering}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Проверить рендеринг
            </button>
            
            <button 
              onClick={viewHtmlBeforeExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Просмотр HTML для печати
            </button>
            
            <button 
              onClick={() => setShowPdfTester(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Сравнить настройки PDF
            </button>
          </div>
          
          {debugInfo || detailedDebugInfo ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold mb-2">Статус сервера</h3>
                <div><span className="font-medium">Статус:</span> {(debugInfo || detailedDebugInfo).status}</div>
                <div><span className="font-medium">Puppeteer установлен:</span> {(debugInfo || detailedDebugInfo).puppeteerInstalled ? 'Да' : 'Нет'}</div>
                {(debugInfo || detailedDebugInfo).lastError && (
                  <div className="text-red-500"><span className="font-medium">Последняя ошибка:</span> {(debugInfo || detailedDebugInfo).lastError.error || (debugInfo || detailedDebugInfo).lastError}</div>
                )}
              </div>
              
              {/* Показываем расширенную информацию о сервере, если она доступна */}
              {detailedDebugInfo?.serverInfo && (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-bold mb-2">Информация о сервере</h3>
                  <div><span className="font-medium">Платформа:</span> {detailedDebugInfo.serverInfo.platform}</div>
                  <div><span className="font-medium">Версия Node.js:</span> {detailedDebugInfo.serverInfo.nodeVersion}</div>
                  <div><span className="font-medium">Время работы:</span> {Math.floor(detailedDebugInfo.serverInfo.uptime / 60)} минут</div>
                  <div><span className="font-medium">Память:</span> {Math.round(detailedDebugInfo.serverInfo.memory.rss / 1024 / 1024)} MB</div>
                </div>
              )}
              
              {/* Показываем расширенный лог отладки, если он доступен */}
              {detailedDebugInfo?.lastPdfGeneration?.debugLog && detailedDebugInfo.lastPdfGeneration.debugLog.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-bold mb-2">Отладочный лог последней генерации</h3>
                  <div className="max-h-64 overflow-y-auto">
                    {detailedDebugInfo.lastPdfGeneration.debugLog.map((log: any, idx: number) => (
                      <div key={idx} className="text-xs mb-1 pb-1 border-b">
                        <span className="font-medium">{new Date(log.time).toLocaleTimeString()}: </span>
                        <span>{log.message}</span>
                        {log.data && (
                          <pre className="text-xs bg-gray-100 p-1 mt-1 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(debugInfo?.debugInfo?.lastPdfGeneration || detailedDebugInfo?.lastPdfGeneration) && (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-bold mb-2">Статистика контента:</h3>
                  <div className="pl-4">
                    <div>Высота тела: {debugInfo?.debugInfo?.lastPdfGeneration?.contentStats?.bodyHeight || detailedDebugInfo?.lastPdfGeneration?.contentStats?.bodyHeight || 'N/A'}px</div>
                    <div>Элементов всего: {debugInfo?.debugInfo?.lastPdfGeneration?.contentStats?.elementsCount || detailedDebugInfo?.lastPdfGeneration?.contentStats?.elementsCount || 'N/A'}</div>
                    <div>Циклов: {debugInfo?.debugInfo?.lastPdfGeneration?.contentStats?.cyclesCount || detailedDebugInfo?.lastPdfGeneration?.contentStats?.cyclesCount || 'N/A'}</div>
                    <div>Групп: {debugInfo?.debugInfo?.lastPdfGeneration?.contentStats?.groupsCount || detailedDebugInfo?.lastPdfGeneration?.contentStats?.groupsCount || 'N/A'}</div>
                    <div>Таблиц: {debugInfo?.debugInfo?.lastPdfGeneration?.contentStats?.tablesCount || detailedDebugInfo?.lastPdfGeneration?.contentStats?.tablesCount || 'N/A'}</div>
                  </div>
                </div>
              )}
              
              {debugInfo?.debugInfo?.lastPdfGeneration?.dimensions && (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-bold mb-2">Размеры страницы:</h3>
                  <div className="pl-4">
                    <div>Ширина: {debugInfo?.debugInfo?.lastPdfGeneration?.dimensions.width || detailedDebugInfo?.lastPdfGeneration?.dimensions.width || 'N/A'}px</div>
                    <div>Высота: {debugInfo?.debugInfo?.lastPdfGeneration?.dimensions.height || detailedDebugInfo?.lastPdfGeneration?.dimensions.height || 'N/A'}px</div>
                    <div>Циклов: {debugInfo?.debugInfo?.lastPdfGeneration?.dimensions.cyclesCount || detailedDebugInfo?.lastPdfGeneration?.dimensions.cyclesCount || 'N/A'}</div>
                    <div>Групп: {debugInfo?.debugInfo?.lastPdfGeneration?.dimensions.groupsCount || detailedDebugInfo?.lastPdfGeneration?.dimensions.groupsCount || 'N/A'}</div>
                  </div>
                </div>
              )}
              
              {debugInfo?.debugInfo?.tempFiles && debugInfo.debugInfo.tempFiles.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-bold mb-2">Отладочные файлы</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {debugInfo.debugInfo.tempFiles.map((file: any, index: number) => (
                      <div key={index} className="p-2 hover:bg-gray-100 rounded flex items-center justify-between">
                        <div className="truncate flex-1">
                          <span className="font-medium">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(file.time).toLocaleString()} 
                            ({Math.round(file.size / 1024)}KB)
                          </span>
                        </div>
                        <button 
                          onClick={() => viewDebugFile(file.name)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Просмотр
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : isLoadingDebugInfo ? (
            <div className="text-center p-10">Загрузка отладочной информации...</div>
          ) : (
            <div className="text-center p-10 text-gray-500">
              Нет доступной отладочной информации. Нажмите "Обновить информацию".
            </div>
          )}
          
          {showPdfTester && <PDFGenerationTester onClose={() => setShowPdfTester(false)} />}
        </div>
      </div>
    );
  };
  
  return (
    <div className="relative">
      <div className="flex">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`px-4 py-2 bg-blue-600 text-white rounded-l-lg hover:bg-blue-700 transition-all duration-200 flex items-center shadow-sm ${className}`}
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              <span>Экспорт...</span>
            </>
          ) : (
            <>
              <Download size={18} className="mr-2" />
              <span>Экспорт</span>
            </>
          )}
        </button>
        
        <button
          onClick={handleDebugMode}
          className="px-2 py-2 bg-gray-600 text-white rounded-r-lg hover:bg-gray-700 transition-all duration-200 flex items-center shadow-sm border-l border-gray-700"
          title="Отладка PDF"
        >
          <Bug size={18} />
        </button>
      </div>
      
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-yellow-100 text-yellow-800 rounded-md text-sm z-50 shadow-md">
          {error}
        </div>
      )}
      
      {renderDebugPanel()}
    </div>
  );
};

export default PDFExportButton; 