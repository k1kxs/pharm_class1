import React from 'react';
import { PDFExporter } from '../utils/PDFExporter';
import { Cycle } from './types';

/**
 * Компонент для генерации PDF документов
 */
export class PDFGenerator extends React.Component {
  /**
   * Генерирует PDF для выбранных циклов
   */
  generatePDF = async (cycles: Cycle[], cycleIds: number[]): Promise<void> => {
    try {
      await PDFExporter.exportToPDF(cycles, cycleIds);
    } catch (error) {
      console.error('Ошибка при генерации PDF:', error);
      throw error;
    }
  }
  
  /**
   * Экспортирует определенный элемент DOM в PDF
   */
  exportElementToPDF = async (element: HTMLElement, fileName: string): Promise<void> => {
    try {
      await PDFExporter.exportDomToPDF(element, fileName);
    } catch (error) {
      console.error('Ошибка при экспорте элемента в PDF:', error);
      throw error;
    }
  }
  
  /**
   * Экспортирует элемент DOM в PDF с максимально точным соответствием веб-интерфейсу
   */
  exportExactToPDF = async (element: HTMLElement, fileName: string): Promise<void> => {
    try {
      await PDFExporter.exportDomExactToPDF(element, fileName);
    } catch (error) {
      console.error('Ошибка при точном экспорте элемента в PDF:', error);
      throw error;
    }
  }
  
  /**
   * Надежный двухэтапный захват и экспорт DOM элемента в PDF
   * Рекомендуется для использования в случае проблем с другими методами
   */
  captureAndExportToPDF = async (element: HTMLElement, fileName: string): Promise<void> => {
    try {
      console.log('Начало захвата DOM элемента и создания PDF...');
      await PDFExporter.captureAndExportToPDF(element, fileName);
      console.log('Захват и экспорт успешно завершены');
    } catch (error) {
      console.error('Ошибка при захвате и экспорте элемента в PDF:', error);
      throw error;
    }
  }
  
  render() {
    // Этот компонент не имеет визуального представления
    return null;
  }
} 