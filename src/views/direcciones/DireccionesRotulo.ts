import { generatePDF } from "@/services/pdfService";
import { useEffect } from "react";
import { Rotulo } from "./types/rotulo.type";
import { useRotulos } from "./hooks/useRotulos";
import { UbicacionDTO } from "./types/ubicaciones.type";

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
  const { rotulos, obtenerRotulos } = useRotulos();
  const generarPDF = async (rotulos: Rotulo[]) => {
    try {
      const content = rotulos.map((rotulo) => [
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
                  text: '',
                  alignment: 'center',
                  fontSize: 12
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
      ]).flat();

      const docDefinition = {
        pageSize: { width: 270, height: 198 },
        pageMargins: [5, 5, 5, 5],
        content
      };

      await generatePDF(docDefinition as any, action === "print" ? "print" : "download");
      onComplete?.();
    } catch (error) {
      console.error("Error al generar los rótulos:", error);
      onError?.(error);
    }
  };
  
  useEffect(()=>{
    if(data){
      obtenerRotulos(data);
    }
  }, [data]);

  useEffect(()=>{
    if(rotulos && rotulos.length > 0){
      generarPDF(rotulos);
    }
  }, [rotulos]);

  return null;
};

export default DireccionesRotulo;