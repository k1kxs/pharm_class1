import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import { Cycle } from './types';
import { processFormattedText } from './utils/textUtils';
import { getLighterColor } from './utils/colorUtils';

// Регистрируем шрифт, поддерживающий кириллицу
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontStyle: 'italic' }
  ]
});

// Создаем стили для PDF
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Roboto',
    backgroundColor: '#fff',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  cycleHeader: {
    padding: 8,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    borderRadius: 5,
    fontSize: 12,
  },
  groupName: {
    fontWeight: 'bold',
    fontSize: 11,
    marginLeft: 5,
    marginTop: 10,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 3,
    color: '#333',
  },
  subgroupName: {
    fontSize: 10,
    marginLeft: 15,
    marginTop: 5,
    marginBottom: 4,
    fontWeight: 'bold',
    color: '#555',
    backgroundColor: '#f5f5f5',
    padding: 3,
    borderRadius: 3,
  },
  table: {
    width: '93%',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 3,
    marginBottom: 8,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  tableHeader: {
    flexDirection: 'row',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    fontSize: 9,
  },
  tableRowEven: {
    backgroundColor: '#f8f8f8',
  },
  categoryCell: {
    width: '33%',
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  preparationsCell: {
    width: '67%',
    padding: 4,
  },
  footer: {
    marginTop: 20,
    fontSize: 8,
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 5,
  },
  preparation: {
    marginLeft: 10,
    marginTop: 5,
  },
  preparationText: {
    fontSize: 9,
    color: '#555',
  },
  bold: {
    fontWeight: 'bold',
  },
});

interface PDFGeneratorProps {
  cycles: Cycle[];
  selectedCycleIds: number[];
}

// Компонент PDF документа
const DrugClassificationPDF: React.FC<{ cycles: Cycle[] }> = ({ cycles }) => {
  // Вспомогательная функция для рендеринга форматированного текста
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    
    // Обрабатываем текст для PDF с поддержкой форматирования
    const processedText = processFormattedText(text);
    
    // Разбиваем текст на сегменты (нормальный, жирный, курсив)
    const segments: React.ReactElement[] = [];
    let currentIndex = 0;
    
    // Последовательно обрабатываем форматированные сегменты
    const boldRegex = /\[\[BOLD\]\](.*?)\[\[\/BOLD\]\]/g;
    const italicRegex = /\[\[ITALIC\]\](.*?)\[\[\/ITALIC\]\]/g;
    
    // Находим все жирные тексты
    let boldMatch;
    while ((boldMatch = boldRegex.exec(processedText)) !== null) {
      // Добавляем текст до текущего жирного сегмента
      if (boldMatch.index > currentIndex) {
        segments.push(
          <Text key={`normal-${currentIndex}`}>
            {processedText.substring(currentIndex, boldMatch.index)}
          </Text>
        );
      }
      
      // Добавляем жирный текст
      segments.push(
        <Text key={`bold-${boldMatch.index}`} style={{ fontWeight: 'bold' }}>
          {boldMatch[1]}
        </Text>
      );
      
      currentIndex = boldMatch.index + boldMatch[0].length;
    }
    
    // Добавляем оставшийся текст
    if (currentIndex < processedText.length) {
      segments.push(
        <Text key={`normal-${currentIndex}`}>
          {processedText.substring(currentIndex)}
        </Text>
      );
    }
    
    return segments;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Классификация лекарственных средств</Text>
          <Text style={styles.subtitle}>ФГБОУ ВО ОрГМУ Минздрава России</Text>
          <Text style={styles.subtitle}>Кафедра фармакологии</Text>
        </View>
        
        {cycles.map((cycle) => (
          <View key={cycle.id}>
            <View 
              style={[
                styles.cycleHeader, 
                { backgroundColor: cycle.gradient && cycle.gradient !== '' ? getLighterColor(cycle.gradient) : '#f3f4f6' }
              ]}
            >
              <Text>{cycle.name}</Text>
            </View>
            
            {cycle.groups.map((group) => (
              <View key={group.id}>
                <Text style={[
                  styles.groupName,
                  group.gradient && group.gradient !== '' ? { backgroundColor: getLighterColor(group.gradient) } : {}
                ]}>{group.name}</Text>
                
                {group.preparations && (
                  <View style={styles.preparation}>
                    <Text style={styles.preparationText}>
                      {renderFormattedText(group.preparations)}
                    </Text>
                  </View>
                )}
                
                {group.subgroups.map((subgroup) => (
                  <View key={subgroup.id}>
                    <Text style={styles.subgroupName}>{subgroup.name}</Text>
                    
                    {subgroup.categories.length > 0 && (
                      <View style={styles.table}>
                        <View 
                          style={[
                            styles.tableHeader, 
                            { backgroundColor: getLighterColor(cycle.gradient) }
                          ]}
                        >
                          <View style={styles.categoryCell}>
                            <Text>Категория</Text>
                          </View>
                          <View style={styles.preparationsCell}>
                            <Text>Препараты</Text>
                          </View>
                        </View>
                        
                        {subgroup.categories.map((category, idx) => (
                          <View 
                            key={category.id} 
                            style={[
                              styles.tableRow, 
                              idx % 2 === 1 ? styles.tableRowEven : {}
                            ]}
                          >
                            <View style={styles.categoryCell}>
                              <Text>{category.name}</Text>
                            </View>
                            <View style={styles.preparationsCell}>
                              <Text>{renderFormattedText(category.preparations)}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}
        
        <View style={styles.footer}>
          <Text>© ФГБОУ ВО ОрГМУ Минздрава России, кафедра фармакологии</Text>
        </View>
      </Page>
    </Document>
  );
};

// Основной компонент генератора PDF
class PDFGenerator {
  constructor(private cycles: Cycle[], private selectedCycleIds: number[]) {}

  // Генерация PDF и скачивание
  async generatePDF() {
    // Фильтруем циклы по выбранным ID
    const selectedCycles = this.cycles.filter(cycle => this.selectedCycleIds.includes(cycle.id));
    
    // Создаем PDF документ
    const pdfDoc = pdf(
      <DrugClassificationPDF cycles={selectedCycles} />
    );
    
    // Получаем blob данные
    const blob = await pdfDoc.toBlob();
    
    // Создаем URL для скачивания
    const url = URL.createObjectURL(blob);
    
    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Классификация_лекарственных_средств.pdf';
    
    // Добавляем ссылку и имитируем клик
    document.body.appendChild(link);
    link.click();
    
    // Удаляем ссылку
    document.body.removeChild(link);
  }
}

export default PDFGenerator; 