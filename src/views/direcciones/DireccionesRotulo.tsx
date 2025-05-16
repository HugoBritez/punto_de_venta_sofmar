import { generatePDF } from "@/shared/services/pdfService";
import { useEffect, useState } from "react";
import { Rotulo } from "./types/rotulo.type";
import { useRotulos } from "./hooks/useRotulos";
import { UbicacionDTO } from "./types/ubicaciones.type";
import JsBarcode from "jsbarcode";

const DireccionesRotulo = ({ 
  data,
  onComplete,
  onError,
  action = "print"
}: {
  data: Omit<UbicacionDTO, 'd_tipo_direccion' | 'd_estado'>;
  onComplete?: () => void;
  onError?: (error: any) => void;
  action?: "print" | "generate";
}) => {
  console.log('Componente DireccionesRotulo montado');
  console.log('Data recibida:', data);
  
  const { rotulos, obtenerRotulos } = useRotulos();
  const [, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  
  const convertirABase64 = async (codbarra: string) => {
    console.log('TRATANDO DE CONVERTIR A BASE64', codbarra);
    if (!codbarra) {
      console.error('El código de barras está vacío');
      return '';
    }
    return new Promise<string>((resolve) => {
      try {
        const canvas = document.createElement("canvas");
        JsBarcode(canvas, codbarra, {
          format: "CODE39",
          lineColor: "#000",
          width: 2,
          height: 100,
          displayValue: false,
          margin: 10
        });
        const base64 = canvas.toDataURL("image/png");
        console.log('Código de barras generado correctamente');
        resolve(base64);
      } catch (error) {
        console.error('Error al generar código de barras:', error);
        resolve('');
      }
    });
  }

  const generarPDF = async (rotulos: Rotulo[]) => {
    try {
      setIsLoading(true);
      console.log('Iniciando generación de PDF con rotulos:', rotulos);
      const content = await Promise.all(rotulos.map(async (rotulo) => {
        const codigoBarrasBase64 = await convertirABase64(rotulo.cod_barras);
        return [
          {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    table: {
                      widths: ['*', '*'],
                      body: [
                        [
                          { text: 'DESCRIPCION ART:', fontSize: 8, bold: true },
                          { text: rotulo.descripcion, fontSize: 8, alignment: 'right' }
                        ],
                        [
                          {
                            colSpan: 2,
                            columns: [
                              {
                                text: 'CODIGO INT:', fontSize: 8, bold: true,
                                width: 'auto'
                              },
                              {
                                text: rotulo.cod_interno, fontSize: 8, alignment: 'left',
                                width: '*'
                              },
                              {
                                text: 'TIPO UBI:', fontSize: 8, bold: true,
                                alignment: 'left',
                                width: 'auto'
                              },
                              {
                                text: rotulo.tipo_ubi, fontSize: 8, alignment: 'left',
                                width: 'auto'
                              }
                            ],
                            columnGap: 5
                          }
                        ],
                        [
                          { text: 'ZONA:', fontSize: 8, bold: true },
                          { text: rotulo.zona, fontSize: 8, alignment: 'left' }
                        ],
                        [
                          { text: 'DIRECCION:', fontSize: 8, bold: true },
                          { text: rotulo.direccion, fontSize: 10, alignment: 'left', bold: true }
                        ]
                      ]
                    },
                    layout: {
                      hLineWidth: () => 0.5,
                      vLineWidth: () => 0.5,
                      hLineColor: () => '#000000',
                      vLineColor: () => '#000000',
                      paddingLeft: () => 5,
                      paddingRight: () => 5,
                      paddingTop: () => 3,
                      paddingBottom: () => 3
                    }
                  }
                ],
                [
                  {
                    image: codigoBarrasBase64,
                    alignment: 'center',
                    width: 200
                  }
                ],
                [
                  {
                    text: rotulo.cod_barras,
                    alignment: 'center',
                    fontSize: 8
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#000000',
              vLineColor: () => '#000000',
              paddingLeft: () => 5,
              paddingRight: () => 5,
              paddingTop: () => 3,
              paddingBottom: () => 3,
            }
          },
          rotulo !== rotulos[rotulos.length - 1] ? { text: '', pageBreak: 'after' } : {}
        ];
      })).then(contents => contents.flat());

      const docDefinition = {
        pageSize: { width: 270, height: 198 },
        pageMargins: [5, 5, 5, 5],
        content
      };

      await generatePDF(docDefinition as any, action === "print" ? "print" : "download");
      onComplete?.();
    } catch (error) {
      console.error("Error al generar los rótulos:", error);
      setError('Error al generar el PDF');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(()=>{
    console.log('useEffect data:', data);
    if(data){
      console.log('Obteniendo rotulos con data:', data);
      obtenerRotulos(data);
    }
  }, [data]);

  useEffect(()=>{
    console.log('useEffect rotulos:', rotulos);
    if(rotulos && rotulos.length > 0){
      console.log('Generando PDF con rotulos:', rotulos);
      generarPDF(rotulos);
    }
  }, [rotulos]);

  return (
    null
  );
};

export default DireccionesRotulo;