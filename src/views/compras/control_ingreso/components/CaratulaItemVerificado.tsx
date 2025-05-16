import { generatePDF } from "@/shared/services/pdfService";
import { useEffect } from "react";


interface CaratulaItemsProps {
  codigo_interno: string;
  codigo_barras: string;
  descripcion: string;
  vencimiento: string;
  lote: string;
  cantidad: number;
  responsable: string;
  onComplete?: () => void;
  onError?: (error: any) => void;
  action?: "print" | "generate";
}


const CaratulaItemVerificado = ({
    codigo_interno,
    codigo_barras,
    descripcion,
    vencimiento,
    lote,
    cantidad,
    responsable,
    onComplete,
    onError,
    action = "print"
}: CaratulaItemsProps) => {

    const generarPDF = async () => {
        try {
            const contenidoPDF = [
              {
                text: "\n",
                fontSize: 2,
              },
              {
                table: {
                  widths: ["*"],
                  headerRows: 0,
                  body: [
                    [
                      {
                        table: {
                          widths: ["*"],
                          body: [
                            [
                              {
                                columns: [
                                  {
                                    stack: [
                                      {
                                        text: "Codigo Interno",
                                        fontSize: 24,
                                        bold: true,
                                      },
                                      {
                                        text: codigo_interno,
                                        fontSize: 36,
                                        margin: [0, 5, 0, 15],
                                        bold: true,
                                      },
                                    ],
                                    width: "50%",
                                    alignment: "center",
                                  },
                                  {
                                    stack: [
                                      {
                                        text: "Codigo Barras",
                                        fontSize: 24,
                                        bold: true,
                                      },
                                      {
                                        text: codigo_barras,
                                        fontSize: 36,
                                        margin: [0, 5, 0, 15],
                                        bold: true,
                                      },
                                    ],
                                    width: "50%",
                                    alignment: "center",
                                  },
                                ],
                              },
                            ],
                            [
                              {
                                stack: [
                                  {
                                    text: "Descripcion",
                                    fontSize: 24,
                                    bold: true,
                                  },
                                  {
                                    text: descripcion,
                                    fontSize: 32,
                                    margin: [0, 5, 0, 15],
                                    bold: true,
                                  },
                                ],
                                alignment: "center",
                              },
                            ],
                            [
                              {
                                columns: [
                                  {
                                    stack: [
                                      {
                                        text: "Vencimiento",
                                        fontSize: 24,
                                        bold: true,
                                      },
                                      {
                                        text: vencimiento,
                                        fontSize: 36,
                                        margin: [0, 5, 0, 15],
                                        bold: true,
                                      },
                                    ],
                                    width: "50%",
                                    alignment: "center",
                                  },
                                  {
                                    stack: [
                                      {
                                        text: "Lote",
                                        fontSize: 24,
                                        bold: true,
                                      },
                                      {
                                        text: lote,
                                        fontSize: 36,
                                        margin: [0, 5, 0, 15],
                                        bold: true,
                                      },
                                    ],
                                    width: "50%",
                                    alignment: "center",
                                  },
                                ],
                              },
                            ],
                            [
                              {
                                columns: [
                                  {
                                    stack: [
                                      {
                                        text: "Cantidad",
                                        fontSize: 24,
                                        bold: true,
                                      },
                                      {
                                        text: cantidad,
                                        fontSize: 36,
                                        margin: [0, 5, 0, 15],
                                        bold: true,
                                      },
                                    ],
                                    width: "50%",
                                    alignment: "center",
                                  },
                                  {
                                    stack: [
                                      {
                                        text: "Ingreso a Depósito",
                                        fontSize: 24,
                                        bold: true,
                                      },
                                      {
                                        text: responsable,
                                        fontSize: 36,
                                        margin: [0, 5, 0, 15],
                                        bold: true,
                                      },
                                    ],
                                    width: "50%",
                                    alignment: "center",
                                  },
                                ],
                              },
                            ],
                          ],
                        },
                        layout: {
                          hLineWidth: function () {
                            return 1;
                          },
                          vLineWidth: function () {
                            return 1;
                          },
                          paddingLeft: function () {
                            return 15;
                          },
                          paddingRight: function () {
                            return 15;
                          },
                          paddingTop: function () {
                            return 15;
                          },
                          paddingBottom: function () {
                            return 15;
                          },
                        },
                      },
                    ],
                  ],
                },
              },
            ];

            const docDefinition = {
                pageSize: { width: 841, height: 595 },
                pageOrientation: 'landscape',
                pageMargins: [20, 20, 20, 20],
                content: contenidoPDF,
                defaultStyle: {
                    font: 'Helvetica'
                }
            };

            await generatePDF(docDefinition as any, action === 'print' ? 'print' : 'download');
            onComplete?.();
            
        } catch (error) {
            onError?.(error);
        }
    }

    useEffect(() => {
        generarPDF();
    }, []);

  return (
    null
  )
}

export default CaratulaItemVerificado
