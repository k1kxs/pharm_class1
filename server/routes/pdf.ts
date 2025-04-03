import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import puppeteer from 'puppeteer';
import { PaperFormat } from 'puppeteer';

const execAsync = promisify(exec);
const router = express.Router();

// Для отладки - сохраняем последнюю ошибку
let lastError: string | null = null;

// Временная переменная для хранения информации о последней генерации PDF
let lastPdfGeneration: any = null;

// Добавим тип для параметров PDF
interface PdfGenerationOptions {
  url: string;
  debug?: boolean;
  waitTimeout?: number;
  scale?: number;
  landscape?: boolean;
  expandAll?: boolean;
  format?: string;
}

router.get('/status', (req, res) => {
  // Проверяем установку Puppeteer
  let puppeteerInstalled = false;
  try {
    const puppeteerTest = require('puppeteer');
    puppeteerInstalled = !!puppeteerTest;
  } catch (e) {
    console.warn('Puppeteer не установлен или не доступен:', e);
  }
  
  // Добавляем информацию о временных файлах
  let tempFiles = [];
  try {
    const tempDir = path.join(__dirname, '../temp');
    if (fs.existsSync(tempDir)) {
      tempFiles = fs.readdirSync(tempDir)
        .filter(file => file.endsWith('.html') || file.endsWith('.pdf') || file.endsWith('.log'))
        .map(file => {
          const filePath = path.join(tempDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            time: stats.mtime.toISOString()
          };
        })
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    }
  } catch (err) {
    console.error('Ошибка при получении списка временных файлов:', err);
  }
  
  res.json({
    status: 'OK',
    puppeteerInstalled,
    lastError,
    debugInfo: {
      lastPdfGeneration,
      tempFiles
    }
  });
});

router.get('/api/pdf/status', (req, res) => {
  console.log('Получен запрос на /api/pdf/status через дублирующийся маршрут');
  res.json({
    status: 'OK',
    lastError: lastError,
    debugInfo: {
      lastPdfGeneration
    }
  });
});

// Маршрут для генерации HTML/PDF с сохранением стилей
router.post('/generate-html', async (req, res) => {
  try {
    const { html } = req.body;
    
    // Если передан HTML, используем его вместо шаблона
    let htmlContent;
    if (html) {
      htmlContent = html;
    } else {
      // Генерируем улучшенный HTML файл для печати с сохранением оформления
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Классификация лекарственных средств</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              margin: 30px; 
              background-color: #f9fafb;
              color: #111827;
              line-height: 1.5;
            }
            h1 { 
              text-align: center; 
              margin-bottom: 20px; 
              color: #1e40af;
              font-weight: 700;
            }
            .export-header { 
              text-align: center; 
              margin-bottom: 30px; 
              padding-bottom: 20px;
              border-bottom: 1px solid #e5e7eb;
            }
            .export-header .org {
              color: #4b5563;
              margin-bottom: 5px;
            }
            .export-header .department {
              color: #6b7280;
              font-size: 0.9em;
            }
            .export-content {
              margin: 20px 0;
            }
            
            /* Стили для классификации */
            .cycle-component {
              margin-bottom: 24px;
              border-radius: 0.5rem;
              background-color: white;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
              overflow: hidden;
            }
            .cycle-header {
              padding: 16px;
              background: linear-gradient(135deg, #3b82f6, #1e40af);
              color: white;
              font-weight: 600;
              font-size: 18px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .group-component {
              margin: 16px;
              border: 1px solid #e5e7eb;
              border-radius: 0.375rem;
              overflow: hidden;
            }
            .group-header {
              padding: 12px 16px;
              background-color: #f3f4f6;
              font-weight: 600;
              border-bottom: 1px solid #e5e7eb;
            }
            .group-content {
              padding: 12px 16px;
            }
            .subgroup-component {
              margin: 12px 0;
              padding-left: 16px;
              border-left: 2px solid #e5e7eb;
            }
            .subgroup-title {
              font-weight: 500;
              margin-bottom: 8px;
              color: #4b5563;
            }
            .medications {
              padding-left: 16px;
            }
            .medication-item {
              margin-bottom: 4px;
              padding: 4px 0;
            }
            
            .export-footer { 
              text-align: center; 
              margin-top: 50px; 
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 0.9em;
            }
            
            /* Стили для печати */
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
              .cycle-component, .group-component, .subgroup-component {
                page-break-inside: avoid;
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="export-header">
            <h1>Классификация лекарственных средств</h1>
            <div class="org">ФГБОУ ВО ОрГМУ Минздрава России</div>
            <div class="department">Кафедра фармакологии</div>
          </div>
          
          <div class="export-content">
            <div class="cycle-component">
              <div class="cycle-header">
                Пример цикла
              </div>
              <div class="group-component">
                <div class="group-header">Группа 1</div>
                <div class="group-content">
                  <div class="subgroup-component">
                    <div class="subgroup-title">Подгруппа 1.1</div>
                    <div class="medications">
                      <div class="medication-item">Препарат 1</div>
                      <div class="medication-item">Препарат 2</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="group-component">
                <div class="group-header">Группа 2</div>
                <div class="group-content">
                  <div class="medications">
                    <div class="medication-item">Препарат 3</div>
                    <div class="medication-item">Препарат 4</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="export-footer">
            © ${new Date().getFullYear()} Кафедра фармакологии ОрГМУ. Все права защищены.
          </div>
        </body>
        </html>
      `;
    }
    
    // Создаем временный файл
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const htmlPath = path.join(tempDir, 'export.html');
    
    // Записываем HTML во временный файл
    fs.writeFileSync(htmlPath, htmlContent);
    
    console.log('HTML файл создан:', htmlPath);
    
    // Отправляем HTML клиенту
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', 'attachment; filename=drug-classification.html');
    res.send(htmlContent);
    
  } catch (err: any) {
    lastError = err.message || 'Неизвестная ошибка';
    console.error('Ошибка при генерации HTML:', err);
    
    res.status(500).json({ 
      error: 'Ошибка при генерации HTML', 
      details: err.message || 'Неизвестная ошибка'
    });
  }
});

// Маршрут для генерации PDF с помощью Puppeteer
router.post('/generate-pdf', async (req, res) => {
  console.log('Получен запрос на /generate-pdf');
  let { url, debug, waitTimeout, scale, expandAll, format } = req.body as PdfGenerationOptions;
  const landscape = req.body.landscape || false;

  // Запишем все полученные параметры для диагностики
  lastPdfGeneration = {
    startTime: new Date().toISOString(),
    url,
    params: { debug, waitTimeout, scale, landscape, expandAll, format },
    status: 'started',
    contentStats: {},
    debugLog: [], // Добавляем лог отладки
    ...(lastPdfGeneration || {})
  };

  // Вспомогательная функция для добавления в лог отладки
  const addDebugLog = (message: string, data?: any) => {
    if (!lastPdfGeneration.debugLog) {
      lastPdfGeneration.debugLog = [];
    }
    lastPdfGeneration.debugLog.push({
      time: new Date().toISOString(),
      message,
      ...(data ? { data } : {})
    });
    
    if (debug) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  };

  debug = debug || false;
  waitTimeout = waitTimeout || 5000;
  // Параметр масштабирования принимаем из запроса или используем значение по умолчанию
  scale = scale || 0.5; 
  expandAll = expandAll || false;
  format = format || "a4"; // По умолчанию A4

  console.log(`Генерация PDF для URL: ${url}`);
  console.log(`Параметры: debug=${debug}, waitTimeout=${waitTimeout}, scale=${scale}, landscape=${landscape}, expandAll=${expandAll}, format=${format}`);
  
  addDebugLog('Начало генерации PDF', { url, params: { debug, waitTimeout, scale, landscape, expandAll, format } });

  let browser;
  let page;

  try {
    // Запускаем браузер с улучшенными настройками для macOS
    addDebugLog('Запуск браузера Puppeteer');
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox", 
        "--disable-setuid-sandbox", 
        "--disable-web-security", 
        "--disable-features=IsolateOrigins,site-per-process",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote"
      ],
      defaultViewport: null
    });
    addDebugLog('Браузер успешно запущен');

    // Открываем новую страницу
    page = await browser.newPage();
    addDebugLog('Новая страница создана');
    
    // Увеличиваем таймаут и размер страницы для лучшей обработки
    page.setDefaultNavigationTimeout(120000); // 2 минуты
    
    // Устанавливаем размер окна - значительно увеличиваем для эффекта "отдаления"
    const viewport = {
      width: landscape ? 3500 : 2400,
      height: landscape ? 2400 : 3500,
      deviceScaleFactor: 1,
    };
    await page.setViewport(viewport);
    addDebugLog('Установлен размер окна', viewport);

    // Устанавливаем дополнительные параметры для expandAll
    if (expandAll) {
      addDebugLog('Активирован режим expandAll для полного раскрытия всех элементов');
      
      // Добавляем параметр expandAll к URL
      if (url.includes('?')) {
        url += '&expandAll=true';
      } else {
        url += '?expandAll=true';
      }
      
      // Увеличиваем таймауты для полного раскрытия
      waitTimeout = Math.max(waitTimeout, 15000);
    }

    // Включаем логи для отладки
    if (debug) {
      page.on('console', msg => {
        const logMessage = msg.text();
        console.log('Браузер:', logMessage);
        addDebugLog('Браузер лог', { message: logMessage });
      });
      
      page.on('pageerror', error => {
        const errorMessage = error.message;
        console.error('Ошибка в браузере:', errorMessage);
        addDebugLog('Ошибка в браузере', { error: errorMessage });
      });
      
      page.on('requestfailed', request => {
        const failedUrl = request.url();
        const errorText = request.failure()?.errorText || 'Неизвестная ошибка';
        addDebugLog('Неудачный запрос ресурса', { url: failedUrl, error: errorText });
      });
    }

    // Обновляем статус
    lastPdfGeneration.status = 'loading_page';
    addDebugLog('Загрузка страницы', { url });

    console.log(`Загрузка страницы: ${url}`);
    
    // Добавляем дополнительные стили для отображения таблиц при загрузке страницы
    await page.evaluateOnNewDocument((scaleValue) => {
      console.log('Добавление глобальных стилей для таблиц');
      
      // Создаем элемент стиля
      const styleElement = document.createElement('style');
      document.head.appendChild(styleElement);
      
      // Добавляем стили для корректного отображения таблиц и других компонентов в PDF
      styleElement.textContent = `
        /* Принудительное уменьшение всего содержимого */
        body {
          /* Удаляем дублирование масштабирования через CSS, т.к. масштабирование будет через параметр scale в puppeteer */
          width: 100% !important;
          height: 100% !important;
          font-size: 11pt !important;
        }
        
        /* Глобальные стили для принудительного отображения таблиц */
        table {
          display: table !important;
          visibility: visible !important;
          opacity: 1 !important;
          height: auto !important;
          width: 100% !important;
          min-height: 20px !important;
          border-collapse: collapse !important;
          border: 1px solid #ccc !important;
          font-size: 10pt !important;
        }
        
        tr {
          display: table-row !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        td, th {
          display: table-cell !important;
          visibility: visible !important;
          opacity: 1 !important;
          padding: 3px !important;
          border: 1px solid #ddd !important;
        }
        
        /* Оптимизация шрифтов */
        body {
          font-size: 11pt !important;
        }
        
        h1 { font-size: 16pt !important; margin: 5px 0 !important; }
        h2 { font-size: 14pt !important; margin: 4px 0 !important; }
        h3 { font-size: 12pt !important; margin: 3px 0 !important; }
        h4 { font-size: 11pt !important; margin: 2px 0 !important; }
        
        /* Уменьшаем отступы для экономии места */
        .cycle-component, .group-component, .subgroup-component {
          margin: 0.3em 0 !important;
          padding: 0.3em !important;
        }
        
        /* Отключаем overflow: hidden для контейнеров с таблицами */
        div.table-container, div:has(> table), .group-content, .subgroup-component {
          overflow: visible !important;
          height: auto !important;
          max-height: none !important;
          display: block !important;
        }
        
        /* Убеждаемся, что все контенты видимы */
        .cycle-component, .group-component, .medication-item {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        /* Скрываем ненужные элементы */
        button, [role="button"], .icon-button, .actions, .edit-controls {
          display: none !important;
        }

        /* Дополнительные стили для раскрытия всех элементов */
        .cycle-component, .group-component, .subgroup-component,
        .cycle-content, .group-content, .subgroup-content,
        .collapse, .accordion-content, .tab-content, .tab-pane,
        [class*="collapse"], [class*="hidden"], [class*="invisible"] {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
        }
        
        /* Специальные стили для контента циклов */
        .cycle-component .cycle-content {
          display: block !important;
          height: auto !important;
          max-height: none !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        /* Специальные стили для контента групп */
        .group-component .group-content {
          display: block !important;
          height: auto !important;
          max-height: none !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        /* Специальные стили для всех скрытых элементов */
        [aria-hidden="true"],
        [hidden],
        .hidden,
        .invisible,
        .collapsed {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          height: auto !important;
        }

        /* Специальные стили для подгрупп - принудительно отображаем содержимое */
        .subgroup-component {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          height: auto !important;
        }
        
        /* Принудительно отображаем содержимое подгрупп (которое обычно скрыто) */
        .subgroup-component > div:nth-child(2),
        .subgroup-component > div.p-3 {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
        }
        
        /* Отображаем подгруппы вне зависимости от состояния isSubgroupExpanded */
        .subgroup-component .p-3.bg-gray-50.rounded-b-lg.border-t,
        .subgroup-component div[class*="bg-gray-50"],
        .subgroup-component div[class*="border-t"] {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          height: auto !important;
          max-height: none !important;
        }

        /* Стили для режима печати */
        @media print {
          @page {
            size: 
            margin: 1.5cm;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            font-size: 9pt !important;
            /* Удаляем дублирование масштабирования через CSS, т.к. масштабирование будет через параметр scale в puppeteer */
            width: 100% !important;
            height: 100% !important;
          }
          
          table, tr, td, th {
            visibility: visible !important;
            break-inside: auto !important;
          }
          
          /* Таблицы должны занимать всю ширину */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            border: 1px solid #ccc !important;
            margin-bottom: 8px !important;
            font-size: 10pt !important;
          }
          
          /* Ячейки с границами */
          td, th {
            border: 1px solid #ccc !important;
            padding: 6px !important;
            text-align: left !important;
          }
          
          /* Оптимизация размеров заголовков */
          h1 { font-size: 16pt !important; margin: 5px 0 !important; }
          h2 { font-size: 14pt !important; margin: 4px 0 !important; }
          h3 { font-size: 12pt !important; margin: 3px 0 !important; }
          h4 { font-size: 11pt !important; margin: 2px 0 !important; }
          
          /* Гарантируем, что все циклы и группы отображаются */
          .cycle-component, .group-component, .subgroup-component,
          .cycle-content, .group-content, .subgroup-content {
            display: block !important;
            visibility: visible !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            margin: 0.3em 0 !important;
            padding: 0.3em !important;
          }
        }
      `;
    }, scale);
    
    // Загружаем страницу
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    
    // Проверяем наличие содержимого и ждем загрузки всего контента
    const contentCheck = await page.evaluate(() => {
      const cycleComponents = document.querySelectorAll('.cycle-component');
      const tables = document.querySelectorAll('table');
      const mainContent = document.querySelector('main') || document.body;
      
      return {
        cyclesCount: cycleComponents.length,
        tablesCount: tables.length,
        hasContent: cycleComponents.length > 0 || tables.length > 0,
        contentHeight: mainContent.scrollHeight,
        bodyHeight: document.body.scrollHeight
      };
    });
    
    console.log('Результаты проверки содержимого:', contentCheck);
    
    // Если контент ещё не загрузился, ждём дополнительное время
    if (!contentCheck.hasContent || contentCheck.cyclesCount === 0) {
      console.log('Контент ещё не загрузился полностью, ждём дополнительное время...');
      await page.waitForTimeout(5000);
    }
    
    // Ждем дополнительное время для полной загрузки всех компонентов
    console.log(`Ожидание ${waitTimeout}мс для полной загрузки...`);
    
    // Обновляем статус
    lastPdfGeneration.status = 'waiting_for_content';
    
    await page.waitForTimeout(waitTimeout);
    
    // Находим и открываем все вкладки
    const tabsResult = await page.evaluate(() => {
      // Ищем все элементы, которые могут быть вкладками
      const possibleTabs = [
        ...Array.from(document.querySelectorAll('[role="tab"]')),
        ...Array.from(document.querySelectorAll('.tabs-item')),
        ...Array.from(document.querySelectorAll('.tab')),
        ...Array.from(document.querySelectorAll('.tab-button')),
        ...Array.from(document.querySelectorAll('[data-tab]')),
        ...Array.from(document.querySelectorAll('button.nav-link')),
      ];
      
      console.log(`Найдено ${possibleTabs.length} возможных вкладок`);
      
      // Перебираем и кликаем по каждой вкладке по очереди
      const clickResults: Array<{
        index: number;
        text: string;
        success: boolean;
        error?: string;
      }> = [];
      
      possibleTabs.forEach((tab, index) => {
        try {
          if (tab instanceof HTMLElement) {
            console.log(`Кликаем по вкладке #${index}: ${tab.textContent?.trim() || 'без текста'}`);
            tab.click();
            clickResults.push({
              index,
              text: tab.textContent?.trim() || 'без текста',
              success: true
            });
          }
        } catch (e) {
          console.error(`Ошибка при клике по вкладке #${index}:`, e);
          clickResults.push({
            index,
            text: tab instanceof HTMLElement ? (tab.textContent?.trim() || 'без текста') : 'не HTMLElement',
            success: false,
            error: String(e)
          });
        }
      });
      
      return {
        tabsCount: possibleTabs.length,
        clickResults
      };
    });
    
    console.log('Результаты открытия вкладок:', tabsResult);
    
    // Ждем, чтобы вкладки успели открыться
    await page.waitForTimeout(2000);
    
    // Выполняем скрипт для исправления таблиц
    console.log('Применение исправлений для таблиц...');
    
    // Первый проход исправления таблиц
    const fixTablesResult = await page.evaluate(() => {
      // Вызываем функцию обнаружения и исправления таблиц
      if (typeof (window as any).detectAndFixTables === 'function') {
        return (window as any).detectAndFixTables();
      }
      return null;
    });
    
    console.log('Результат первого прохода исправления таблиц:', fixTablesResult);
    
    // Даем время для применения всех изменений
    await page.waitForTimeout(2000);
    
    // Добавляю скрипт для открытия всех вкладок и раскрытия всех элементов
    console.log('Открываем все вкладки и раскрываем все элементы...');
    
    await page.evaluate(() => {
      console.log('Начинаем открытие всех вкладок и раскрытие элементов...');
      
      // Функция для открытия всех вкладок и свернутых элементов
      function expandAllElements() {
        // Открываем все вкладки (используя расширенный список селекторов)
        const tabSelectors = [
          '[role="tab"]',
          '.tabs-item',
          '.tab',
          '.tab-button',
          '[data-tab]',
          'button.nav-link',
          '.cycle-header',
          '.group-header',
          '.cycle-component .group',
          '.cycle-component button',
          '[aria-controls]',
          '[data-bs-toggle="tab"]',
          '[data-toggle="tab"]',
          '.nav-tabs .nav-link',
          '.accordion-button',
          '.accordion-header button',
          '.MuiTab-root'
        ];
        
        // Объединяем все селекторы и находим элементы
        const allTabElements = tabSelectors.flatMap(selector => 
          Array.from(document.querySelectorAll(selector))
        );
        
        // Кликаем по всем возможным табам
        allTabElements.forEach(tab => {
          if (tab instanceof HTMLElement) {
            try {
              tab.click();
            } catch (err) {}
          }
        });
        
        // Делаем все элементы видимыми
        document.querySelectorAll('.cycle-component, .group-component, .subgroup-component').forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.display = 'block';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
          }
        });
        
        // Специальная обработка для подгрупп - принудительное раскрытие
        document.querySelectorAll('.subgroup-component').forEach(subgroup => {
          if (subgroup instanceof HTMLElement) {
            // Принудительно устанавливаем стиль display: block для всего компонента
            subgroup.style.display = 'block';
            subgroup.style.visibility = 'visible';
            subgroup.style.opacity = '1';
            subgroup.style.height = 'auto';
            subgroup.style.maxHeight = 'none';
            
            // Находим кнопку разворачивания подгруппы
            const toggleButton = subgroup.querySelector('.cursor-pointer');
            if (toggleButton instanceof HTMLElement) {
              try {
                // Пытаемся кликнуть на кнопку разворачивания
                toggleButton.click();
              } catch (err) {
                console.log('Ошибка при клике на кнопку подгруппы:', err);
              }
            }
            
            // Находим контент подгруппы (второй div в компоненте)
            // Это элемент, который обычно скрыт когда isSubgroupExpanded === false
            const subgroupContent = subgroup.querySelector('.p-3.bg-gray-50.rounded-b-lg.border-t');
            if (subgroupContent instanceof HTMLElement) {
              // Принудительно отображаем контент подгруппы
              subgroupContent.style.display = 'block';
              subgroupContent.style.visibility = 'visible';
              subgroupContent.style.opacity = '1';
              subgroupContent.style.height = 'auto';
              subgroupContent.style.maxHeight = 'none';
              subgroupContent.style.overflow = 'visible';
              
              // Удаляем атрибуты, которые могут влиять на отображение
              subgroupContent.removeAttribute('aria-hidden');
              subgroupContent.removeAttribute('hidden');
              
              // Находим все вложенные элементы и тоже делаем их видимыми
              subgroupContent.querySelectorAll('*').forEach(el => {
                if (el instanceof HTMLElement) {
                  el.style.display = el.tagName === 'TABLE' ? 'table' : 
                                     el.tagName === 'TR' ? 'table-row' : 
                                     el.tagName === 'TD' || el.tagName === 'TH' ? 'table-cell' : 'block';
                  el.style.visibility = 'visible';
                  el.style.opacity = '1';
                }
              });
            }
            
            // Альтернативный способ найти контент подгруппы, если первый не сработал
            if (!subgroupContent) {
              // Находим все div внутри подгруппы
              const allDivs = subgroup.querySelectorAll('div');
              
              // Перебираем div начиная со второго (первый обычно заголовок)
              for (let i = 1; i < allDivs.length; i++) {
                const div = allDivs[i];
                if (div instanceof HTMLElement) {
                  // Принудительно отображаем этот div
                  div.style.display = 'block';
                  div.style.visibility = 'visible';
                  div.style.opacity = '1';
                  div.style.height = 'auto';
                  div.style.maxHeight = 'none';
                }
              }
            }
          }
        });
        
        return "Элементы развернуты";
      }
      
      console.log("Финальный проход раскрытия элементов...");
      return expandAllElements();
    });
    
    // Последний таймаут перед созданием PDF
    await page.waitForTimeout(2000);
    
    // Если после первого прохода все еще есть невидимые таблицы, делаем второй проход
    if (fixTablesResult && fixTablesResult.hasInvisible) {
      console.log('Выполняем второй проход исправления таблиц...');
      
      // Применяем дополнительные стили непосредственно через DOM
      await page.evaluate(() => {
        // Дополнительно вставляем инлайн-стили для таблиц
        document.querySelectorAll('table').forEach(table => {
          // Создаем новую таблицу с теми же данными, но гарантированно отображаемую
          const newTable = document.createElement('table');
          newTable.setAttribute('style', 'display: table !important; visibility: visible !important; opacity: 1 !important; width: 100% !important; border-collapse: collapse !important; border: 1px solid #ccc !important;');
          newTable.setAttribute('border', '1');
          newTable.setAttribute('cellpadding', '5');
          newTable.setAttribute('cellspacing', '0');
          
          // Клонируем содержимое исходной таблицы
          const rows = table.querySelectorAll('tr');
          rows.forEach(row => {
            const newRow = document.createElement('tr');
            newRow.setAttribute('style', 'display: table-row !important; visibility: visible !important;');
            
            const cells = row.querySelectorAll('td, th');
            cells.forEach(cell => {
              const newCell = document.createElement(cell.tagName.toLowerCase());
              newCell.innerHTML = cell.innerHTML;
              newCell.setAttribute('style', 'display: table-cell !important; visibility: visible !important; border: 1px solid #ccc !important; padding: 8px !important;');
              newRow.appendChild(newCell);
            });
            
            newTable.appendChild(newRow);
          });
          
          // Если исходная таблица пуста, добавляем тестовую строку для диагностики
          if (rows.length === 0) {
            const testRow = document.createElement('tr');
            const testCell = document.createElement('td');
            testCell.textContent = 'Тестовая ячейка';
            testCell.setAttribute('style', 'display: table-cell !important; visibility: visible !important; border: 1px solid #ccc !important; padding: 8px !important;');
            testRow.appendChild(testCell);
            newTable.appendChild(testRow);
          }
          
          // Заменяем исходную таблицу новой
          if (table.parentNode) {
            table.parentNode.insertBefore(newTable, table);
            table.parentNode.removeChild(table);
          }
        });
        
        return document.querySelectorAll('table').length;
      });
      
      // Даем время для применения изменений после второго прохода
      await page.waitForTimeout(1000);
    }
    
    // Обновляем статус
    lastPdfGeneration.status = 'analyzing_content';

    // Используем JavaScript для проверки, что контент загружен и получаем подробную статистику
    const contentStats = await page.evaluate(() => {
      // Проверка и подсчет элементов классификации
      const cycles = document.querySelectorAll('.cycle-component');
      const groups = document.querySelectorAll('.group-component');
      const tables = document.querySelectorAll('table');
      const medications = document.querySelectorAll('.medication-item');
      
      // Проверка видимости элементов
      const getVisibleCount = (elements: NodeListOf<Element>) => {
        let count = 0;
        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
            count++;
          }
        });
        return count;
      };
      
      // Проверяем содержимое таблиц
      const tableDetails = Array.from(tables).map(table => {
        const rows = table.querySelectorAll('tr');
        const cells = table.querySelectorAll('td, th');
        return {
          rowCount: rows.length,
          cellCount: cells.length,
          isEmpty: cells.length === 0,
          isVisible: window.getComputedStyle(table).display !== 'none',
          parent: table.parentElement ? table.parentElement.className : 'unknown'
        };
      });
      
      // Получение размеров контейнера содержимого
      const content = document.querySelector('.export-content') || document.body;
      const contentRect = content.getBoundingClientRect();
      
      return {
        cycles: {
          total: cycles.length,
          visible: getVisibleCount(cycles)
        },
        groups: {
          total: groups.length,
          visible: getVisibleCount(groups)
        },
        tables: {
          total: tables.length,
          visible: getVisibleCount(tables),
          details: tableDetails
        },
        medications: {
          total: medications.length,
          visible: getVisibleCount(medications)
        },
        contentSize: {
          width: contentRect.width,
          height: contentRect.height,
          aspectRatio: contentRect.width / contentRect.height
        }
      };
    });

    console.log(`Анализ контента:`, contentStats);
    
    // Сохраняем статистику в lastPdfGeneration
    lastPdfGeneration.contentStats = contentStats;
    lastPdfGeneration.status = 'generating_pdf';
    
    // Оптимизация страницы перед созданием PDF
    await page.evaluate(() => {
      console.log('Оптимизация страницы для PDF экспорта...');
      
      // Скрываем все ненужные элементы управления
      const elementsToHide = [
        'button:not(.print-visible)', 
        '[role="button"]:not(.print-visible)', 
        '.icon-button:not(.print-visible)', 
        '.actions:not(.print-visible)', 
        '.edit-controls:not(.print-visible)',
        'input[type="button"]:not(.print-visible)',
        '.btn:not(.print-visible)',
        '.search-container:not(.print-visible)'
      ];
      
      elementsToHide.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          if(el instanceof HTMLElement) {
            el.style.display = 'none';
          }
        });
      });
      
      // Гарантируем видимость всех нужных элементов
      const elementsToShow = [
        'table', 'tr', 'td', 'th', 
        '.cycle-component', '.group-component', '.subgroup-component',
        '.cycle-content', '.group-content', '.subgroup-content',
        '.medications-list', '.medication-item', '.description', '.table-component'
      ];
      
      elementsToShow.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          if(el instanceof HTMLElement) {
            if(el.tagName === 'TABLE') {
              el.style.display = 'table';
              el.style.width = '100%';
              el.style.borderCollapse = 'collapse';
              el.style.border = '1px solid #ccc';
            } 
            else if(el.tagName === 'TR') {
              el.style.display = 'table-row';
            } 
            else if(el.tagName === 'TD' || el.tagName === 'TH') {
              el.style.display = 'table-cell';
              el.style.border = '1px solid #ccc';
              el.style.padding = '8px';
            } 
            else {
              el.style.display = 'block';
            }
            
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            
            // Устраняем переполнение
            if(el.style.overflow === 'hidden') {
              el.style.overflow = 'visible';
            }
            
            // Убираем ограничения по высоте
            if(el.style.maxHeight && el.style.maxHeight !== 'none') {
              el.style.maxHeight = 'none';
            }
          }
        });
      });
      
      // Добавляем стили для корректного отображения при печати
      const printStyle = document.createElement('style');
      printStyle.textContent = `
        @media print {
          @page { margin: 1.5cm; }
          
          /* Базовые стили для печати */
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Стили для таблиц */
          table {
            display: table !important;
            visibility: visible !important;
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 10px !important;
          }
          
          tr { display: table-row !important; }
          td, th { 
            display: table-cell !important; 
            border: 1px solid #ccc !important;
            padding: 8px !important;
          }
          
          /* Избегаем разрывов внутри компонентов */
          .cycle-component, .group-component {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Отключаем скрытие содержимого */
          .cycle-content, .group-content, .subgroup-content {
            display: block !important;
            visibility: visible !important;
            height: auto !important;
          }
        }
      `;
      document.head.appendChild(printStyle);
      
      return "Страница оптимизирована для экспорта PDF";
    });
    
    // Даем время браузеру применить все изменения
    await page.waitForTimeout(1000);
    
    // Подробное логирование для отладки параметра scale
    console.log(`Детальная информация о масштабе:`, {
      scaleType: typeof scale,
      scaleValue: scale,
      parsedScale: parseFloat(scale as any),
      isNaN: isNaN(parseFloat(scale as any))
    });

    console.log(`Создание PDF с масштабом: ${scale}, форматом: ${format}, ориентацией: ${landscape ? 'альбомная' : 'портретная'}`);
    
    // Добавляем лог перед созданием PDF
    addDebugLog('Начало создания PDF файла', { 
      scale, 
      format, 
      landscape, 
      dimensions: {
        width: page.viewport()?.width,
        height: page.viewport()?.height
      }
    });
    
    // Генерация PDF с применением масштаба напрямую через Puppeteer
    const pdfBuffer = await page.pdf({
      format: format as PaperFormat,
      printBackground: true,
      margin: {
        top: "1.5cm",
        bottom: "1.5cm",
        left: "1.5cm",
        right: "1.5cm",
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="width: 100%; font-size: 10px; text-align: center; color: #777;">
          <span>Экспорт классификации препаратов</span>
        </div>
      `,
      footerTemplate: `
        <div style="width: 100%; font-size: 10px; text-align: center; color: #777;">
          <span>Страница <span class="pageNumber"></span> из <span class="totalPages"></span></span>
        </div>
      `,
      // Явно преобразуем в число для гарантии правильного типа
      scale: typeof scale === 'string' ? parseFloat(scale) : scale, 
      landscape: landscape,
      preferCSSPageSize: false
    });

    await browser.close();
    
    // Получаем и сохраняем информацию о размере PDF
    const pdfSizeKb = Math.round(pdfBuffer.length / 1024);
    
    // Обновляем информацию о завершении
    lastPdfGeneration.endTime = new Date().toISOString();
    lastPdfGeneration.success = true;
    lastPdfGeneration.status = 'completed';
    lastPdfGeneration.pdfSize = pdfSizeKb;
    lastPdfGeneration.processingTime = new Date().getTime() - new Date(lastPdfGeneration.startTime).getTime();

    console.log(`PDF успешно создан, размер: ${pdfSizeKb}KB, время: ${lastPdfGeneration.processingTime}мс`);
    
    // Проверяем наличие контента
    if (contentStats.cycles.total === 0 && contentStats.tables.total === 0) {
      console.warn('ВНИМАНИЕ: В PDF отсутствуют циклы и таблицы!');
      lastPdfGeneration.warnings = ['В PDF отсутствуют циклы и таблицы'];
    } else if (contentStats.cycles.visible === 0 && contentStats.tables.visible === 0) {
      console.warn('ВНИМАНИЕ: В PDF нет видимых циклов и таблиц!');
      lastPdfGeneration.warnings = ['В PDF нет видимых циклов и таблиц'];
    } else if (contentStats.tables.visible === 0 && contentStats.tables.total > 0) {
      console.warn('ВНИМАНИЕ: В PDF есть таблицы, но они невидимы!');
      lastPdfGeneration.warnings = ['В PDF есть таблицы, но они невидимы'];
    }
    
    // Отправляем PDF клиенту
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=drug-classification.pdf');
    res.send(pdfBuffer);
    
  } catch (err: any) {
    // В случае ошибки, сохраняем информацию и отправляем статус 500
    lastError = err.message || 'Неизвестная ошибка';
    
    lastPdfGeneration.endTime = new Date().toISOString();
    lastPdfGeneration.success = false;
    lastPdfGeneration.status = 'failed';
    lastPdfGeneration.error = lastError;
    lastPdfGeneration.processingTime = new Date().getTime() - new Date(lastPdfGeneration.startTime).getTime();
    
    console.error('Ошибка при генерации PDF:', err);
    
    res.status(500).json({ 
      error: 'Ошибка при генерации PDF', 
      details: err.message || 'Неизвестная ошибка'
    });
  }
});

// Добавим улучшенный обработчик ошибок
const handleError = (err: any, message: string): { error: string, details?: string, stack?: string } => {
  console.error(`${message}:`, err);
  
  // Сохраняем ошибку для статуса
  lastError = {
    time: new Date().toISOString(),
    message: message,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined
  };
  
  // Если есть последняя генерация PDF, обновляем её статус
  if (lastPdfGeneration) {
    lastPdfGeneration.status = 'error';
    lastPdfGeneration.error = lastError;
    lastPdfGeneration.endTime = new Date().toISOString();
  }
  
  return {
    error: message,
    details: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined
  };
};

// Маршрут для получения детальной отладочной информации
router.get('/debug-info', (req, res) => {
  console.log('Получен запрос на /debug-info');
  
  // Формируем отладочную информацию
  const debugInfo = {
    lastPdfGeneration,
    lastError,
    serverInfo: {
      platform: process.platform,
      nodeVersion: process.version,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    },
    tempFiles: []
  };
  
  // Добавляем информацию о временных файлах, если они есть
  try {
    const tempDir = path.join(__dirname, '../temp');
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir)
        .filter(file => file.endsWith('.html') || file.endsWith('.pdf') || file.endsWith('.log'))
        .map(file => {
          const filePath = path.join(tempDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            time: stats.mtime.toISOString()
          };
        })
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        
      debugInfo.tempFiles = files;
    }
  } catch (err) {
    console.error('Ошибка при получении списка временных файлов:', err);
    debugInfo.tempFilesError = err instanceof Error ? err.message : String(err);
  }
  
  res.json(debugInfo);
});

export default router; 