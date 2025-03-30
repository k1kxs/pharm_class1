import { Cycle } from './types';
import PDFExporter from '../utils/PDFExporter';

/**
 * Класс-адаптер для совместимости со старым кодом
 * Просто перенаправляет вызовы к новому PDFExporter
 */
class PDFGenerator {
  private cycles: Cycle[];
  private selectedCycleIds: number[];

  constructor(cycles: Cycle[], selectedCycleIds: number[]) {
    this.cycles = cycles;
    this.selectedCycleIds = selectedCycleIds;
  }

  /**
   * Генерирует PDF используя новый PDFExporter
   */
  async generatePDF() {
    await PDFExporter.exportToPDF(this.cycles, this.selectedCycleIds);
  }
}

export default PDFGenerator; 