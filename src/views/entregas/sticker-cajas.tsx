import { api_url } from "@/utils";
import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { generatePDF } from "@/services/pdfService";
import GaesaLogo from "@/assets/logos/gaesa_logo.jpg";

interface StickerData {
  pedido_id: number;
  cantidad_cajas: number;
  cliente_id: number;
  cliente: string;
  ciudad: string;
  direccion: string;
  barrio: string;
  zona: string;
  preparado_por: string;
  verificado_por: string;
}

interface StickerCajasProps {
  pedidoId: number | null;
  onComplete?: () => void;
  onError?: (error: any) => void;
  action?: "print" | "generate";
}

const StickerCajas = ({
  pedidoId,
  onComplete,
  onError,
  action = "print",
}: StickerCajasProps) => {
  const [stickerData, setStickerData] = useState<StickerData | null>(null);
  const toast = useToast();

  const convertImageToBase64 = (imgUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);

        try {
          const dataUrl = canvas.toDataURL("image/jpeg");
          resolve(dataUrl);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error("Error loading image"));
      img.src = imgUrl;
    });
  };

  const generarPDF = async (data: StickerData) => {
    try {
      console.log("Intentando generar PDF con datos:", data);
      const gaesaLogoBase64 = await convertImageToBase64(GaesaLogo);

      const stickersContent = Array.from(
        { length: data.cantidad_cajas },
        (_, index) => [
          { text: "\n", fontSize: 2 }, // Espacio más pequeño entre stickers
          {
            table: {
              widths: ["*"],
              body: [
                [
                  {
                    columns: [
                      {
                        text: `Cod. Cliente: ${data.cliente_id}`,
                        width: "60%",
                        fontSize: 8,
                      },
                      {
                        text: new Date().toLocaleString(),
                        width: "40%",
                        fontSize: 8,
                        alignment: "right",
                      },
                    ],
                  },
                ],
                [
                  {
                    text: `Cliente: ${data.cliente}`,
                    fontSize: 8,
                    margin: [0, 1, 0, 1],
                  },
                ],
                [
                  {
                    text: `Dirección: ${data.direccion}`,
                    fontSize: 8,
                    margin: [0, 1, 0, 1],
                  },
                ],
                [
                  {
                    text: `Zona: ${data.zona}`,
                    fontSize: 8,
                    margin: [0, 1, 0, 1],
                  },
                ],
                [
                  {
                    columns: [
                      {
                        text: `Pedido Nro. ${data.pedido_id}`,
                        width: "60%",
                        fontSize: 8,
                      },
                      {
                        text: `Caja: ${index + 1}/${data.cantidad_cajas}`,
                        width: "40%",
                        fontSize: 8,
                        alignment: "right",
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
                            text: "Volumen",
                            fontSize: 8,
                            alignment: "center",
                            margin: [0, 0, 0, 2], // Pequeño margen inferior
                          },
                          {
                            table: {
                              widths: ["*"],
                              body: [[" "]], // Celda vacía
                            },
                            layout: {
                              hLineWidth: () => 0.5,
                              vLineWidth: () => 0.5,
                              hLineColor: () => "#000000",
                              vLineColor: () => "#000000",
                            },
                            margin: [2, 0, 2, 0],
                            height: 40, 
                          },
                        ],
                        width: "50%",
                      },
                      {
                        stack: [
                          {
                            text: "Peso",
                            fontSize: 8,
                            alignment: "center",
                            margin: [0, 0, 0, 2],
                          },
                          {
                            table: {
                              widths: ["*"],
                              body: [[" "]], // Celda vacía
                            },
                            layout: {
                              hLineWidth: () => 0.5,
                              vLineWidth: () => 0.5,
                              hLineColor: () => "#000000",
                              vLineColor: () => "#000000",
                            },
                            margin: [2, 0, 2, 0],
                            height: 40,
                          },
                        ],
                        width: "50%",
                      },
                    ],
                    margin: [0, 5, 0, 5],
                  },
                ],
                [
                  {
                    columns: [
                      {
                        stack: [
                          {
                            text: `Preparado por: ${data.preparado_por}`,
                            fontSize: 8,
                            margin: [0, 15, 0, 0],
                          },
                          {
                            text: `Verificado por: ${data.verificado_por}`,
                            fontSize: 8,
                            margin: [0, 5, 0, 0],
                          },
                        ],
                        width: "*",
                      },
                      {
                        image: gaesaLogoBase64,
                        width: 50,
                        height: 15,
                        alignment: "right",
                        margin: [0, 15, 0, 0],
                      },
                    ],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: (_i: number) => 0.5,
              vLineWidth: (_i: number) => 0.5,
              hLineColor: (_i: number) => "#000000",
              vLineColor: (_i: number) => "#000000",
              paddingLeft: (_i: number) => 5,
              paddingRight: (_i: number) => 5,
              paddingTop: (_i: number) => 3,
              paddingBottom: (_i: number) => 3,
            },
          },
          { text: "\n", fontSize: 2 },
        ]
      ).flat();

      const docDefinition = {
        pageSize: { width: 283.46, height: 220.42 }, 
        pageMargins: [15, 15, 15, 15],
        content: stickersContent,
      };

      await generatePDF(
        docDefinition as any,
        action === "print" ? "print" : "download"
      );

      toast({
        title: "PDF generado con éxito",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Llamar al callback de éxito
      onComplete?.();
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast({
        title: "Error al generar PDF",
        description: "Hubo un problema al generar el documento",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      // Llamar al callback de error
      console.log("Error al generar PDF:", error);
      onError?.(error);
    }
  };

  useEffect(() => {
    const fetchStickerData = async () => {
      try {
        console.log("Fetching sticker data for pedidoId:", pedidoId);

        if (!pedidoId) {
          throw new Error("ID de pedido no proporcionado");
        }

        const response = await axios.get(`${api_url}pedidos/numero-cajas`, {
          params: { id: pedidoId },
        });

        console.log("Respuesta del servidor:", response.data);

        if (!response.data.body || !response.data.body[0]) {
          throw new Error("No se recibieron datos del servidor");
        }

        const data = response.data.body[0];
        console.log("Datos procesados:", data);

        setStickerData(data);
        // Generar PDF con los datos directamente, sin esperar al estado
        await generarPDF(data);
      } catch (error) {
        console.error("Error detallado al obtener datos:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Error desconocido";
        toast({
          title: "Error al obtener datos del sticker",
          description: errorMessage,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        onError?.(error);
      }
    };

    if (pedidoId) {
      fetchStickerData();
    }
  }, [pedidoId]);

  if (!stickerData) {
    return <div>Cargando datos del sticker...</div>;
  }

  return null;
};

export default StickerCajas;
