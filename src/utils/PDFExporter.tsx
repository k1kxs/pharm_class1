import { Cycle } from '../components/types';
import html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Класс для экспорта классификации лекарственных средств в PDF
 */
export class PDFExporter {
  /**
   * Экспортирует выбранные циклы в PDF
   */
  static async exportToPDF(cycles: Cycle[], selectedCycleIds: number[]): Promise<void> {
    const selectedCycles = cycles.filter(cycle => selectedCycleIds.includes(cycle.id));
    
    // Проверка на наличие данных
    if (selectedCycles.length === 0) {
      console.warn('Нет выбранных циклов для экспорта');
      return;
    }
    
    // Выбираем метод экспорта
    try {
      // Метод с html2pdf (использует живой HTML для визуального форматирования)
      console.log('Пробуем метод с html2pdf...');
      await this.exportWithHtml2PDF(selectedCycles);
    } catch (error) {
      console.error('Ошибка при создании PDF через html2pdf:', error);
      
      // Если html2pdf не сработал, используем прямой метод jsPDF
      console.log('Пробуем альтернативный метод с jsPDF...');
      try {
        this.exportWithJsPDF(selectedCycles);
        console.log('PDF успешно создан через jsPDF');
      } catch (jsPdfError) {
        console.error('Ошибка при создании PDF через jsPDF:', jsPdfError);
        
        // Оповещаем пользователя об ошибке
        alert('Не удалось создать PDF. Пожалуйста, проверьте консоль для подробностей.');
      }
    }
  }
  
  /**
   * Метод экспорта использующий html2pdf.js
   * Создает визуально-форматированный документ путем преобразования HTML в PDF
   */
  private static async exportWithHtml2PDF(cycles: Cycle[]): Promise<void> {
    // Создаем HTML-элемент для преобразования в PDF
    const container = document.createElement('div');
    container.id = 'pdf-container';
    container.style.width = '210mm'; // Ширина A4
    container.style.fontFamily = 'Roboto, Arial, sans-serif';
    container.style.padding = '10mm';
    container.style.margin = '0';
    container.style.boxSizing = 'border-box';
    
    // Делаем контейнер видимым, но вне потока документа
    // Вместо скрытия используем position: fixed и z-index: -9999
    container.style.position = 'fixed';
    container.style.zIndex = '-9999';
    container.style.top = '0';
    container.style.left = '0';
    container.style.right = '0';
    container.style.backgroundColor = 'white'; // Убедимся, что фон белый
    
    // Добавляем дополнительный параметр для отладки
    // ВНИМАНИЕ: Для отладки установите в true, для продакшена в false
    const debugMode = false;
    
    if (debugMode) {
      container.style.position = 'static';
      container.style.zIndex = '9999';
      container.style.border = '2px solid red';
      container.style.padding = '20px';
      container.style.margin = '20px';
    }
    
    // Добавляем стили для лучшей печати и обработки шрифтов
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
      
      @page {
        margin: 0;
        size: A4;
      }
      
      @media print {
        body, html {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
      
      #pdf-container * {
        font-family: 'Roboto', Arial, sans-serif;
      }
      
      .pdf-container { color: #333; }
      .cycle-header { margin-bottom: 15mm; text-align: center; }
      .cycle-title { font-size: 22px; font-weight: 600; margin-bottom: 3mm; }
      .cycle-subtitle { font-size: 14px; font-weight: 400; color: #666; }
      
      .section-header { 
        background-color: #f8fafc; 
        padding: 3mm; 
        border-radius: 2mm; 
        margin-bottom: 3mm; 
      }
      
      .group-container { margin-bottom: 8mm; }
      .group-header { 
        font-size: 16px; 
        font-weight: 500; 
        border-left: 0.8mm solid; 
        padding-left: 2mm; 
        margin-bottom: 2mm; 
      }
      
      .subgroup-container { margin-left: 3mm; margin-bottom: 6mm; }
      .subgroup-header { 
        font-size: 14px; 
        font-weight: 500; 
        border-left: 0.6mm solid; 
        padding-left: 1.5mm; 
        margin-bottom: 1.5mm;
      }
      
      .category-container { 
        margin-left: 6mm; 
        margin-bottom: 4mm; 
        background-color: #f9fafb;
        border-radius: 1.5mm;
        padding: 2mm 3mm;
        border-left: 0.4mm solid;
      }
      .category-title { font-size: 12px; font-weight: 500; margin-bottom: 1mm; }
      
      .preparations { 
        margin-left: 3mm; 
        margin-bottom: 3mm; 
        font-size: 10px; 
        line-height: 1.4;
      }
      
      .table-container { 
        margin-left: 3mm; 
        margin-bottom: 4mm; 
        border-radius: 1mm; 
        overflow: hidden; 
        border: 0.2mm solid #e2e8f0;
      }
      
      table { 
        width: 100%; 
        border-collapse: collapse; 
        font-size: 9px;
      }
      
      thead { background-color: #5b42f3; color: white; }
      th { 
        text-align: left; 
        padding: 1.5mm 2mm; 
        font-weight: 500;
        border-right: 0.2mm solid rgba(255,255,255,0.3);
      }
      
      td { 
        padding: 1.5mm 2mm; 
        border-right: 0.2mm solid #e2e8f0;
        border-top: 0.2mm solid #e2e8f0;
      }
      
      tr:nth-child(even) { background-color: #f8fafc; }
      
      .divider {
        border: none;
        border-top: 0.2mm solid #eee;
        margin: 6mm 0;
      }
      
      .footer {
        text-align: center;
        font-size: 8px;
        color: #999;
        margin-top: 10mm;
        padding-top: 3mm;
        border-top: 0.2mm solid #eee;
      }
    `;
    container.appendChild(styleElement);
    
    // Заголовок документа
    const headerContainer = document.createElement('div');
    headerContainer.className = 'cycle-header';
    
    const title = document.createElement('div');
    title.className = 'cycle-title';
    title.textContent = 'Классификация лекарственных средств';
    
    const subtitle = document.createElement('div');
    subtitle.className = 'cycle-subtitle';
    subtitle.textContent = 'Современный справочник для медицинских специалистов';
    
    headerContainer.appendChild(title);
    headerContainer.appendChild(subtitle);
    container.appendChild(headerContainer);
    
    // Добавляем содержимое каждого цикла
    cycles.forEach((cycle, index) => {
      if (index > 0) {
        const divider = document.createElement('hr');
        divider.className = 'divider';
        container.appendChild(divider);
      }
      
      // Заголовок цикла
      const sectionHeader = document.createElement('div');
      sectionHeader.className = 'section-header';
      sectionHeader.textContent = cycle.name;
      sectionHeader.style.backgroundColor = this.hexToRgba(cycle.gradient || '#5b42f3', 0.1);
      sectionHeader.style.borderLeft = `1mm solid ${cycle.gradient || '#5b42f3'}`;
      container.appendChild(sectionHeader);
      
      // Добавляем группы
      cycle.groups.forEach(group => {
        const groupContainer = document.createElement('div');
        groupContainer.className = 'group-container';
        
        // Заголовок группы
        const groupHeader = document.createElement('div');
        groupHeader.className = 'group-header';
        groupHeader.textContent = group.name;
        groupHeader.style.borderLeftColor = group.gradient || cycle.gradient || '#5b42f3';
        groupContainer.appendChild(groupHeader);
        
        // Препараты группы
        if (group.preparations && group.preparations.trim()) {
          const prepsContainer = document.createElement('div');
          prepsContainer.className = 'preparations';
          prepsContainer.innerHTML = this.sanitizeHtml(group.preparations);
          groupContainer.appendChild(prepsContainer);
        }
        
        // Таблицы группы
        if (group.tables && group.tables.length > 0) {
          group.tables.forEach(table => {
            const tableContainer = this.createTableElement(table, group.gradient || cycle.gradient || '#5b42f3');
            groupContainer.appendChild(tableContainer);
          });
        }
        
        // Подгруппы
        group.subgroups.forEach(subgroup => {
          const subgroupContainer = document.createElement('div');
          subgroupContainer.className = 'subgroup-container';
          
          // Заголовок подгруппы
          const subgroupHeader = document.createElement('div');
          subgroupHeader.className = 'subgroup-header';
          subgroupHeader.textContent = subgroup.name;
          subgroupHeader.style.borderLeftColor = group.gradient || cycle.gradient || '#5b42f3';
          subgroupContainer.appendChild(subgroupHeader);
          
          // Препараты подгруппы
          if (subgroup.preparations && subgroup.preparations.trim()) {
            const prepsContainer = document.createElement('div');
            prepsContainer.className = 'preparations';
            prepsContainer.innerHTML = this.sanitizeHtml(subgroup.preparations);
            subgroupContainer.appendChild(prepsContainer);
          }
          
          // Таблицы подгруппы
          if (subgroup.tables && subgroup.tables.length > 0) {
            subgroup.tables.forEach(table => {
              const tableContainer = this.createTableElement(table, group.gradient || cycle.gradient || '#5b42f3');
              subgroupContainer.appendChild(tableContainer);
            });
          }
          
          // Категории
          subgroup.categories.forEach(category => {
            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'category-container';
            categoryContainer.style.borderLeftColor = group.gradient || cycle.gradient || '#5b42f3';
            
            // Заголовок категории
            const categoryTitle = document.createElement('div');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = category.name;
            categoryContainer.appendChild(categoryTitle);
            
            // Препараты категории
            if (category.preparations && category.preparations.trim()) {
              const prepsContainer = document.createElement('div');
              prepsContainer.className = 'preparations';
              prepsContainer.style.marginLeft = '0';
              prepsContainer.innerHTML = this.sanitizeHtml(category.preparations);
              categoryContainer.appendChild(prepsContainer);
            }
            
            // Таблицы категории
            if (category.tables && category.tables.length > 0) {
              category.tables.forEach(table => {
                const tableContainer = this.createTableElement(table, group.gradient || cycle.gradient || '#5b42f3');
                tableContainer.style.marginLeft = '0';
                categoryContainer.appendChild(tableContainer);
              });
            }
            
            subgroupContainer.appendChild(categoryContainer);
          });
          
          groupContainer.appendChild(subgroupContainer);
        });
        
        container.appendChild(groupContainer);
      });
    });
    
    // Добавляем подвал
    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.textContent = `Классификация лекарственных средств © ${new Date().getFullYear()}`;
    container.appendChild(footer);
    
    // Добавляем элемент в DOM для конвертации
    document.body.appendChild(container);
    
    // Добавляем небольшую задержку перед созданием PDF, увеличиваем до 1 секунды
    // чтобы убедиться, что все DOM элементы отрендерились и шрифты загружены
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Настройки для PDF с улучшенной обработкой изображений
    const options = {
      margin: [10, 10, 10, 10],
      filename: 'Классификация_лекарственных_средств.pdf',
      image: { 
        type: 'jpeg', 
        quality: 1.0  // Максимальное качество 
      },
      html2canvas: { 
        scale: 2,  // Увеличение разрешения
        useCORS: true,
        letterRendering: true,
        logging: true,
        backgroundColor: '#FFFFFF',
        allowTaint: true,  // Разрешаем обработку всех ресурсов
        imageTimeout: 3000,  // Увеличиваем таймаут для загрузки изображений
        removeContainer: true  // Автоматически удалять временный контейнер
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      fontFaces: [
        {
          family: 'Roboto',
          weight: 400
        },
        {
          family: 'Roboto',
          weight: 500
        },
        {
          family: 'Roboto',
          weight: 700
        }
      ]
    };
    
    try {
      console.log('Начинаем генерацию PDF...');
      // Генерируем PDF и скачиваем
      await html2pdf().from(container).set(options).save();
      console.log('PDF успешно создан');
    } catch (error) {
      console.error('Ошибка при создании PDF:', error);
      
      // В случае ошибки попробуем альтернативный метод
      if (debugMode) {
        console.log('Элемент для экспорта:', container.outerHTML);
      }
    } finally {
      // Удаляем временный элемент
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  }
  
  /**
   * Метод экспорта с использованием jsPDF напрямую
   * Создает более структурированный документ программным путем
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
    doc.text('Современный справочник для медицинских специалистов', pageWidth / 2, margin + 10, { align: 'center' });
    
    let y = margin + 20;
    
    // Добавляем циклы
    cycles.forEach((cycle, cycleIndex) => {
      // Проверяем, нужно ли перейти на следующую страницу
      if (y > pageHeight - margin - 30) {
        doc.addPage();
        y = margin;
      }
      
      if (cycleIndex > 0) {
        // Разделитель между циклами
        y += 10;
        doc.setDrawColor(238, 238, 238);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
      }
      
      // Заголовок цикла - упрощенный вариант
      const cycleColor = this.hexToRgb(cycle.gradient || '#5b42f3');
      doc.setFillColor(cycleColor.r, cycleColor.g, cycleColor.b);
      doc.setDrawColor(cycleColor.r, cycleColor.g, cycleColor.b);
      
      try {
        // Рисуем прямоугольник с закругленными углами
        doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
      } catch (e) {
        // В случае ошибки используем обычный прямоугольник
        doc.rect(margin, y, contentWidth, 10, 'F');
      }
      
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
        
        // Заголовок группы
        doc.setTextColor(51, 51, 51);
        doc.setFontSize(12);
        doc.setDrawColor(
          this.hexToRgb(group.gradient || cycle.gradient || '#5b42f3').r,
          this.hexToRgb(group.gradient || cycle.gradient || '#5b42f3').g,
          this.hexToRgb(group.gradient || cycle.gradient || '#5b42f3').b
        );
        
        // Вертикальная полоса для группы
        doc.setLineWidth(0.8);
        doc.line(margin, y, margin, y + 7);
        
        // Название группы
        doc.setFontSize(12);
        doc.text(group.name, margin + 3, y + 4);
        
        y += 10;
        
        // Препараты группы (упрощенно, только текст)
        if (group.preparations && group.preparations.trim()) {
          // Очищаем HTML от тегов для простого отображения
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
        
        // Подгруппы (упрощенное отображение)
        if (group.subgroups && group.subgroups.length > 0) {
          group.subgroups.forEach(subgroup => {
            if (y > pageHeight - margin - 15) {
              doc.addPage();
              y = margin;
            }
            
            // Название подгруппы
            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            doc.setDrawColor(
              this.hexToRgb(group.gradient || cycle.gradient || '#5b42f3').r,
              this.hexToRgb(group.gradient || cycle.gradient || '#5b42f3').g,
              this.hexToRgb(group.gradient || cycle.gradient || '#5b42f3').b
            );
            
            // Вертикальная полоса для подгруппы
            doc.setLineWidth(0.5);
            doc.line(margin + 5, y, margin + 5, y + 5);
            
            // Название подгруппы
            doc.text(subgroup.name, margin + 8, y + 3);
            
            y += 8;
            
            // Препараты подгруппы (только текст)
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
          });
        }
        
        y += 5;
      });
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
        pageHeight - 5,
        { align: 'center' }
      );
    }
    
    // Скачиваем PDF
    doc.save('Классификация_лекарственных_средств.pdf');
  }
  
  /**
   * Создает HTML-элемент таблицы
   */
  private static createTableElement(table: any, color: string): HTMLElement {
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';
    
    const tableElement = document.createElement('table');
    
    // Заголовок таблицы
    if (table.rows && table.rows.length > 0) {
      const thead = document.createElement('thead');
      thead.style.backgroundColor = color;
      
      const headerRow = document.createElement('tr');
      
      table.rows[0].cells.forEach((cell: any) => {
        const th = document.createElement('th');
        th.innerHTML = this.sanitizeHtml(cell.content || '');
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      tableElement.appendChild(thead);
      
      // Тело таблицы
      const tbody = document.createElement('tbody');
      
      table.rows.slice(1).forEach((row: any) => {
        const tr = document.createElement('tr');
        
        row.cells.forEach((cell: any) => {
          const td = document.createElement('td');
          td.innerHTML = this.sanitizeHtml(cell.content || '');
          tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
      });
      
      tableElement.appendChild(tbody);
    }
    
    tableContainer.appendChild(tableElement);
    return tableContainer;
  }
  
  /**
   * Преобразует HEX-цвет в RGBA
   */
  private static hexToRgba(hex: string, alpha: number = 1): string {
    const rgb = this.hexToRgb(hex);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }
  
  /**
   * Преобразует HEX-цвет в RGB объект
   */
  private static hexToRgb(hex: string): { r: number, g: number, b: number } {
    // Убираем # если есть
    hex = hex.replace(/^#/, '');
    
    // Парсим RGB значения
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    
    return { r, g, b };
  }
  
  /**
   * Очищает HTML от опасных элементов
   */
  private static sanitizeHtml(html: string): string {
    if (!html) return '';
    
    // В реальном приложении здесь должна быть полная санитизация
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  }
  
  /**
   * Убирает HTML-теги из текста
   */
  private static stripHtml(html: string): string {
    if (!html) return '';
    
    return html
      .replace(/<[^>]*>/g, ' ') // Заменяем все теги на пробел
      .replace(/\s+/g, ' ')     // Убираем множественные пробелы
      .trim();                  // Убираем пробелы в начале и конце
  }
}

export default PDFExporter;
