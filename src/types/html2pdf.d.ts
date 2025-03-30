declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[] | [number, number, number, number];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      letterRendering?: boolean;
      allowTaint?: boolean;
      imageTimeout?: number;
      removeContainer?: boolean;
      [key: string]: any;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: string;
      compress?: boolean;
      [key: string]: any;
    };
    pagebreak?: {
      mode?: string[];
      [key: string]: any;
    };
    fontFaces?: Array<{
      family: string;
      weight?: number;
      style?: string;
    }>;
    [key: string]: any;
  }

  interface Html2PdfInstance {
    from(element: HTMLElement): Html2PdfInstance;
    set(options: Html2PdfOptions): Html2PdfInstance;
    save(): Promise<void>;
    output(type: string, options?: any): Promise<any>;
    outputPdf(type?: string, options?: any): any;
  }

  function html2pdf(): Html2PdfInstance;
  
  export = html2pdf;
} 