import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Download } from 'lucide-react';

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
  waitTimeout?: number;
  scale?: number;
  format?: string;
  landscape?: boolean;
  expandAll?: boolean;
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({ className }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      }
    `;
    
    return cssText;
  };
  
  // Функция для экспорта PDF через сервер
  const serverPdfExport = async (customParams: PdfExportParams = {}) => {
    try {
      // Проверяем статус сервера перед отправкой запроса
      const serverAvailable = await checkServerStatus();
      
      if (!serverAvailable) {
        setError('Сервер PDF недоступен. Пожалуйста, обратитесь к администратору.');
        console.error('Сервер PDF недоступен. Экспорт отменен.');
        setIsExporting(false);
        return;
      }
      
      // Получаем URL для печати
      const printUrl = `${window.location.origin}${window.location.pathname}?print=true`;
      
      // Базовые параметры для экспорта
      const params = {
        url: customParams.url || printUrl,
        waitTimeout: customParams.waitTimeout || 15000,
        scale: customParams.scale || 0.75,
        format: customParams.format || "a4",
        landscape: customParams.landscape || false,
        expandAll: customParams.expandAll || true,
      };
      
      console.log('Экспорт PDF с параметрами:', params);
      
      // Отправляем запрос на генерацию PDF
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/pdf/generate`, 
        {
          url: params.url,
          options: {
            format: params.format,
            scale: params.scale,
            waitTimeout: params.waitTimeout,
            landscape: params.landscape,
          }
        },
        {
          responseType: 'blob',
          timeout: 60000 // Увеличиваем таймаут до 60 секунд
        }
      );
      
      // Создаем объект URL для скачивания файла
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Формируем имя файла (можно настроить)
      const date = new Date();
      const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
      link.setAttribute('download', `Лекарственные_препараты_${formattedDate}.pdf`);
      
      // Нажимаем на ссылку для скачивания и удаляем её
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Сбрасываем состояние и очищаем URL
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        setIsExporting(false);
        setError(null);
      }, 100);
      
    } catch (err) {
      console.error('Ошибка при генерации PDF:', err);
      
      // Обрабатываем различные типы ошибок
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ErrorResponse>;
        
        console.error('Детали ошибки Axios:', {
          url: axiosError.config?.url,
          method: axiosError.config?.method,
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText
        });
        
        // Проверяем, есть ли данные в ответе
        if (axiosError.response?.data) {
          try {
            // Если ответ - это Blob, пытаемся прочитать его как текст
            if (axiosError.response.data instanceof Blob) {
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const errorText = reader.result as string;
                  const errorJson = JSON.parse(errorText);
                  setError(`Ошибка: ${errorJson.error || 'Неизвестная ошибка'}`);
                } catch (parseErr) {
                  setError('Ошибка при генерации PDF. Попробуйте еще раз позже.');
                }
              };
              reader.readAsText(axiosError.response.data);
            } else {
              // Если это не Blob, возможно это уже объект
              const errorData = axiosError.response.data as ErrorResponse;
              setError(`Ошибка: ${errorData.error || 'Неизвестная ошибка'}`);
            }
          } catch (parseErr) {
            console.error('Ошибка при разборе ответа:', parseErr);
            setError('Ошибка при генерации PDF. Попробуйте еще раз позже.');
          }
        } else {
          setError(`Ошибка при запросе: ${axiosError.message}`);
        }
      } else {
        setError(`Ошибка: ${(err as Error).message || 'Неизвестная ошибка'}`);
      }
      
      setIsExporting(false);
    }
  };
  
  // Основная функция экспорта PDF
  const handleExport = async () => {
    setError(null);
    setIsExporting(true);
    
    try {
      // Используем серверный экспорт
      await serverPdfExport();
    } catch (err) {
      console.error('Ошибка при экспорте PDF:', err);
      setError(`Ошибка при экспорте: ${(err as Error).message}`);
      setIsExporting(false);
    }
  };
  
  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center shadow-sm ${className}`}
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
      
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-yellow-100 text-yellow-800 rounded-md text-sm z-50 shadow-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default PDFExportButton;