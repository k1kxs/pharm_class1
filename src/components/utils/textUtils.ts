// Функция для обработки форматированного текста в PDF
export const processFormattedText = (text: string): string => {
  if (!text) return '';
  
  console.log('Обработка форматированного текста:', text);
  
  // Для PDF форматируем текст с использованием стилей вместо HTML-тегов
  // Заменяем HTML теги на специальные пометки для дальнейшей обработки
  let processedText = text
    .replace(/<b>|<strong>/g, '[[BOLD]]')
    .replace(/<\/b>|<\/strong>/g, '[[/BOLD]]')
    .replace(/<i>|<em>/g, '[[ITALIC]]')
    .replace(/<\/i>|<\/em>/g, '[[/ITALIC]]');
    
  // Обработка списков
  processedText = processedText
    .replace(/<ol>/g, '\n[[LIST_START]]\n')
    .replace(/<\/ol>/g, '\n[[LIST_END]]\n')
    .replace(/<ul>/g, '\n[[BULLET_LIST_START]]\n')
    .replace(/<\/ul>/g, '\n[[BULLET_LIST_END]]\n')
    .replace(/<li>/g, '[[ITEM]] ')
    .replace(/<\/li>/g, '\n');
    
  // Обработка параграфов
  processedText = processedText
    .replace(/<p>/g, '\n')
    .replace(/<\/p>/g, '\n');
    
  // Удаляем все остальные HTML теги и заменяем спецсимволы
  processedText = processedText
    .replace(/<[^>]*>/g, '') // Удаляем все остальные HTML теги
    .replace(/&nbsp;/g, ' ') // Заменяем неразрывные пробелы на обычные
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
    
  console.log('Результат обработки:', processedText);
  
  return processedText;
};

// Функция для поиска по тексту
export const textContainsQuery = (text: string, query: string): boolean => {
  if (!text || !query) return false;
  
  // Очищаем текст от HTML тегов для поиска
  const cleanText = text.replace(/<[^>]*>/g, '');
  return cleanText.toLowerCase().includes(query.toLowerCase());
};

// Функция для форматирования текста
export const formatText = (text: string, isBold: boolean, isItalic: boolean): string => {
  let formattedText = text;
  
  if (isBold) {
    formattedText = `<b>${formattedText}</b>`;
  }
  
  if (isItalic) {
    formattedText = `<i>${formattedText}</i>`;
  }
  
  return formattedText;
}; 