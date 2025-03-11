import { useEffect } from "react";
import { generatePDF } from "@/services/pdfService";
import axios from "axios";
import { useSucursalStore } from "@/stores/sucursalStore";
import { api_url } from "@/utils";
import logopresupuesto from "@/assets/logosdocumentos/logopresupuesto.jpg"
import logopresupuestopie from "@/assets/logosdocumentos/logopresupuestopie.jpg"

interface NotaPresupuestoProps {
  presupuesto: number;
  onComplete: () => void;
  onError: (error: any) => void;
  action: "print" | "download";
}

interface PresupuestoPDF {
  id: number;
  cliente_razon: string;
  cliente_ruc: string;
  cliente_direccion: string;
  condicion_pago: string;
  plazo_entrega: string;
  flete: string;
  subtotal: number;
  total: number;
  vendedor: string;
  observacion: string;
  items: {
    codigo_barra: string;
    descripcion: string;
    marca: string;
    cantidad: number;
    precio: number;
    subtotal: number;
  }[];
}

export const NotaPresupuesto = ({
  presupuesto,
  onComplete,
  onError,
  action,
}: NotaPresupuestoProps) => {
  const { sucursalData, fetchSucursalData } = useSucursalStore((state) => ({
    sucursalData: state.sucursalData,
    fetchSucursalData: state.fetchSucursalData,
  }));
;

  const fecha_actual = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const usuario_actual = sessionStorage.getItem("user_name");

  useEffect(() => {
    console.log('Iniciando el componente');
    fetchSucursalData().then(() => {
      getPresupuesto();
    }).catch(error => {
      onError(error);
    });
  }, []);

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

  const getPresupuesto = async () => {
    try {
      console.log('Empezando a obtener el presupuesto');
      const response = await axios.get(
        `${api_url}presupuestos/imprimir-presupuesto`,
        {
          params: {
            id: presupuesto,
          },
        }
      );
      const data = response.data.body;
      
      if (data) {
        console.log('El presupuesto es', data);
        await generarPDF(data);
      } else {
        onError("No se encontraron datos del presupuesto");
      }
    } catch (error) {
      onError(error);
    }
  };

  const generarPDF = async (presupuestoData: PresupuestoPDF) => {
    try {
      const logoHeader = await convertImageToBase64(logopresupuesto);
      const logoFooter = await convertImageToBase64(logopresupuestopie);

      const docDefinition = {
        pageSize: {
          width: 595.28,
          height: 841.89,
        },
        pageMargins: [20, 100, 20, 80],
        info: {
          title: "Nota de Presupuesto",
          author: sucursalData?.nombre_emp || "Sistema",
          subject: "Nota de Presupuesto",
          keywords: "presupuesto, nota",
        },
        header: {
          margin: [20, 20, 20, 20],
          columns: [
            {
              image: logoHeader,
              width: 550,
              height: 80,
              alignment: "left",
            },
          ],
        },
        // Definición del pie de página
        footer: {
          margin: [20, 0, 20, 5],
          columns: [
            {
              image: logoFooter,
              width: 550,
              height: 60,
              alignment: "left",
            }
          ],
        },
        content: [
          {
            columns: [
              {
                text: `Fecha: ${fecha_actual}`,
                fontSize: 10,
                width: "*",
                alignment: "left",
              },
              {
                text: `Hecho por ${usuario_actual}`,
                fontSize: 10,
                width: "*",
                alignment: "right",
              },
            ],
            margin: [0, 10, 0, 0],
          },
          {
            columns: [
              {
                text: `Cliente: ${presupuestoData.cliente_razon}`,
                fontSize: 10,
                width: "*",
                alignment: "left",
              },
              {
                text: `RUC: ${presupuestoData.cliente_ruc}`,
                fontSize: 10,
                width: "*",
                alignment: "right",
              },
            ],
            margin: [0, 10, 0, 0],
          },
          {
            text: `Dirección: ${presupuestoData.cliente_direccion}`,
            fontSize: 10,
            width: "*",
            alignment: "left",
          },
          {
            columns: [
              {
                width: "auto",
                table: {
                  widths: ["auto"],
                  body: [
                    [
                      {
                        text: `Presupuesto Nro. ${presupuestoData.id}`,
                        fontSize: 10,
                        bold: true,
                        alignment: "center",
                        margin: [8, 4, 8, 4],
                      },
                    ],
                  ],
                },
                height: 800,
                layout: {
                  hLineWidth: function () {
                    return 2;
                  },
                  vLineWidth: function () {
                    return 2;
                  },
                  hLineColor: function () {
                    return "#333333";
                  },
                  vLineColor: function () {
                    return "#333333";
                  },
                  paddingLeft: function () {
                    return 4;
                  },
                  paddingRight: function () {
                    return 4;
                  },
                  paddingTop: function () {
                    return 2;
                  },
                  paddingBottom: function () {
                    return 2;
                  },
                },
              },
              {
                text: "De nuestra consideración, nos dirigimos a usted con el objeto de informarle acerca del SIGUENTE PRESUPUESTO QUE EXPRESA, LOS PRECIOS, CONDICIONES DE PAGO Y PLAZO DE ENTREGA ESTABLECIDOS POR EL ASESOR DE VENTAS",
                fontSize: 8,
                width: "*",
                alignment: "left",
                margin: [15, 0, 0, 0],
              },
            ],
            margin: [0, 10, 0, 0],
          },
          {
            table: {
              headerRows: 1,
              widths: ["auto", "*", "auto", "auto", "auto", "auto"],
              body: [
                [
                  {
                    text: "Cod. Barras",
                    fontSize: 10,
                    width: "*",
                  },
                  {
                    text: "Descripción",
                    fontSize: 10,
                    width: "*",
                  },
                  {
                    text: "Marca",
                    fontSize: 10,
                    width: "*",
                  },
                  {
                    text: "Cantidad",
                    fontSize: 10,
                    width: "*",
                  },
                  {
                    text: "Precio",
                    fontSize: 10,
                    width: "*",
                  },
                  {
                    text: "Subtotal",
                    fontSize: 10,
                    width: "*",
                  },
                ],
                ...presupuestoData.items.map((item) => [
                  {
                    text: item.codigo_barra,
                    fontSize: 8,
                    width: "*",
                  },
                  {
                    text: item.descripcion,
                    fontSize: 8,
                    width: "*",
                  },
                  {
                    text: item.marca,
                    fontSize: 8,
                    width: "*",
                  },
                  {
                    text: item.cantidad,
                    fontSize: 8,
                    width: "*",
                    alignment: "center",
                  },
                  {
                    text: item.precio,
                    fontSize: 8,
                    width: "*",
                    alignment: "right",
                  },
                  {
                    text: item.subtotal,
                    fontSize: 8,
                    width: "*",
                    alignment: "right",
                  },
                ]),
              ],
            },
            margin: [0, 10, 0, 10],
            layout: {
              hLineWidth: function (i: number, node: any) {
                return i === 0 || i === 1 || i === node.table.body.length
                  ? 1
                  : 0;
              },
              vLineWidth: function () {
                return 0;
              },
              paddingLeft: function () {
                return 6;
              },
              paddingRight: function () {
                return 6;
              },
              paddingTop: function () {
                return 3;
              },
              paddingBottom: function () {
                return 3;
              },
            },
          },
          {
            columns: [
              {
                text: `Obs.: ${presupuestoData.observacion}`,
                fontSize: 10,
                width: "*",
              },
              {
                text: `Subtotal: ${presupuestoData.subtotal}`,
                fontSize: 10,
                width: "*",
                alignment: "right",
              },
            ],
          },
          {
            text: `Total: ${presupuestoData.total}`,
            fontSize: 10,
            width: "*",
            alignment: "right",
          },
          {
            text: `Este presupuesto tiene una validez de ${presupuestoData.plazo_entrega}`,
            fontSize: 10,
            width: "*",
            alignment: "left",
          },
          {
            text: `Todos los precios incluyen  IVA`,
            fontSize: 10,
            width: "*",
            alignment: "left",
          },
          {
            text: `CONDICION DE PAGO: ${presupuestoData.condicion_pago}`,
            fontSize: 10,
            width: "*",
            alignment: "left",
          },
          {
            text: ` ${presupuestoData.condicion_pago}, a partir de la confirmacion y pago de la entrega del mismo `,
            fontSize: 10,
            width: "*",
            alignment: "left",
          },
          {
            text: `Flete: ${presupuestoData.flete}`,
            fontSize: 10,
            width: "*",
            alignment: "left",
          },
          {
            columns: [
              {
                stack: [
                  {
                    text: "_______________________________",
                    fontSize: 8,
                    width: "*",
                    alignment: "center",
                  },
                  {
                    text: `Vendedor: ${presupuestoData.vendedor}`,
                    fontSize: 8,
                    width: "*",
                    alignment: "center",
                  },
                ],
              },
              {
                stack: [
                  {
                    text: "_______________________________",
                    fontSize: 8,
                    width: "*",
                    alignment: "center",
                  },
                  {
                    text: `GERENTE COMERCIAL`,
                    fontSize: 8,
                    width: "*",
                    alignment: "center",
                  },
                ],
              },
            ],
            margin: [0, 50, 0, 0],
          },
        ],
      };

      const result = await generatePDF(docDefinition as any, action);
      console.log("Resultado de generatePDF:", result);

      if (result.success) {
        console.log("PDF generado exitosamente");
        onComplete?.();
      } else {
        console.error("Error al generar PDF:", result.message);
        onError?.(result.message);
      }
    } catch (error) {
      onError(error);
    }
  };

  return null;
};
