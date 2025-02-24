import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import printjs from "print-js";

interface PDFProps {
  pageSize?: {
    width: number;
    height: number | 'auto';
  };
  pageMargins?: number[];
  info?: {
    title: string;
    author: string;
    subject: string;
    keywords: string;
  };
  styles?: Record<string, any>;
  content: any[];
}

type OutputType = 'print' | 'b64' | 'download';

interface PDFResponse {
  success: boolean;
  content: string | null;
  message: string;
}

export const generatePDF = async (
  props: PDFProps, 
  output: OutputType = 'print'
): Promise<PDFResponse> => {
  return new Promise((resolve, reject) => {
    try {
      const {
        pageSize = {
          width: 226.77,
          height: 'auto'
        },
        pageMargins = [5.66, 5.66, 5.66, 5.66],
        info = {
          title: 'Documento',
          author: 'Sistema',
          subject: 'Documento PDF',
          keywords: 'pdf, documento'
        },
        styles = {
          header: {
            fontSize: 9,
            bold: true,
            alignment: 'center',
          },
        },
        content
      } = props;

      const docDefinition = {
        pageSize,
        pageMargins,
        info,
        content,
        styles
      };

      const pdfDoc = pdfMake.createPdf(docDefinition as any);

      switch (output) {
        case 'b64':
          pdfDoc.getBase64((data) => {
            resolve({
              success: true,
              content: data,
              message: 'Archivo generado correctamente.'
            });
          });
          break;

        case 'print':
          pdfDoc.getBase64((data) => {
            printjs({
              printable: data,
              type: 'pdf',
              base64: true
            });
            resolve({
              success: true,
              content: null,
              message: 'Documento enviado a impresión.'
            });
          });
          break;

        case 'download':
          pdfDoc.download();
          resolve({
            success: true,
            content: null,
            message: 'Documento descargado correctamente.'
          });
          break;

        default:
          reject({
            success: false,
            content: null,
            message: 'Tipo de salida no válido.'
          });
      }
    } catch (error) {
      reject({
        success: false,
        content: null,
        message: error instanceof Error ? error.message : 'Error al generar el PDF'
      });
    }
  });
};