// Функция для обработки форматированного текста в PDF
export const processFormattedText = (text: string): string => {
  if (!text) return '';
  
  // Для PDF форматируем текст с использованием стилей вместо HTML-тегов
  // Заменяем HTML теги на специальные пометки для дальнейшей обработки
  return text
    .replace(/<b>|<strong>/g, '[[BOLD]]')
    .replace(/<\/b>|<\/strong>/g, '[[/BOLD]]')
    .replace(/<i>|<em>/g, '[[ITALIC]]')
    .replace(/<\/i>|<\/em>/g, '[[/ITALIC]]')
    .replace(/<[^>]*>/g, '') // Удаляем все остальные HTML теги
    .replace(/&nbsp;/g, ' '); // Заменяем неразрывные пробелы на обычные
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