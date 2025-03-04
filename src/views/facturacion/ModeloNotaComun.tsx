import { Configuraciones } from "@/types/shared_interfaces";
import axios from "axios";
import { api_url } from "@/utils";
import { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { generatePDF } from "@/services/pdfService";

interface ModeloNotaComunProps {
  id_venta?: number;
  monto_entregado?: number;
  monto_recibido?: number;
  vuelto?: number;
  onImprimir?: boolean;
}

interface VentaTicket {
  codigo: number;
  tipo_venta: string;
  fecha_venta: string;
  fecha_vencimiento: string;
  cajero: string;
  vendedor: string;
  cliente: string;
  direccion: string;
  telefono: string;
  ruc: string;
  subtotal: number;
  total_descuento: number;
  total_a_pagar: number;
  total_exentas: number;
  total_diez: number;
  total_cinco: number;
  timbrado: string;
  factura: string;
  factura_valido_desde: string;
  factura_valido_hasta: string;
  detalles: {
    codigo: number;
    descripcion: string;
    cantidad: number;
    precio: number;
    descuento: number;
    total: number;
  }[];
  sucursal_data: {
    sucursal_direccion: string;
    sucursal_telefono: string;
    sucursal_empresa: string;
    sucursal_ruc: string;
    sucursal_matriz: string;
  }[];
}

const ModeloNotaComun = ({
  id_venta,

  onImprimir = false,
}: ModeloNotaComunProps) => {
  const [venta, setVenta] = useState<VentaTicket | null>(null);
  const [configuraciones, setConfiguraciones] = useState<
    Configuraciones[] | null
  >(null);
  const [prevOnImprimir, setPrevOnImprimir] = useState(false);
  const toast = useToast();
  const fechaActual = new Date().toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const generarPDF = async () => {
    try {
      const detallesVenta =
        venta?.detalles.map((detalle) => [
          detalle.codigo.toString(),
          detalle.descripcion,
          detalle.cantidad.toString(),
          `${(Number(detalle.precio) || 0).toLocaleString("es-PY")}`,
          detalle.total
            ? `${Number(detalle.total).toLocaleString("es-PY")}`
            : "0",
        ]) || [];


      await generatePDF(
        {
          pageSize: { width: 595.28, height: 841.89 },
          pageMargins: [40, 20, 40, 20],
          info: {
            title: `Nota ${venta?.codigo}`,
            author: "Sistema de Ventas",
            subject: "Nota de Venta",
            keywords: "venta, nota",
          },
          content: [
            // Cabecera
            {
              columns: [
                {
                  width: "50%",
                  stack: [
                    {
                      text: venta?.sucursal_data[0].sucursal_empresa,
                      style: "header",
                      alignment: "left",
                      fontSize: 18,
                      bold: true,
                      margin: [0, 0, 0, 5],
                    },
                    {
                      text: venta?.sucursal_data[0].sucursal_ruc,
                      style: "header",
                      alignment: "left",
                      fontSize: 16,
                      bold: true,
                    },
                  ],
                },
                {
                  width: "50%",
                  stack: [
                    {
                      text: venta?.sucursal_data[0].sucursal_telefono,
                      style: "header",
                      alignment: "right",
                      fontSize: 12,
                      bold: true,
                      margin: [0, 0, 0, 5],
                    },
                    {
                      text: fechaActual,
                      style: "header",
                      alignment: "right",
                      fontSize: 12,
                      bold: true,
                    },
                  ],
                },
              ],
            },
            // Información de la factura en dos columnas
            {
              columns: [
                // Columna izquierda
                {
                  width: "50%",
                  stack: [
                    {
                      text: `Fecha Venta: ${venta?.fecha_venta}`,
                      fontSize: 10,
                    },
                    { text: `Venta Nro: ${venta?.codigo}`, fontSize: 10 },
                    { text: `Cliente: ${venta?.cliente}`, fontSize: 10 },
                    { text: `Ruc: ${venta?.ruc}`, fontSize: 10 },
                    {
                      text: `Dirección: ${venta?.direccion || "N/A"}`,
                      fontSize: 10,
                      alignment: "left",
                    },
                    {
                      text: `Telef: ${venta?.telefono || "N/A"}`,
                      fontSize: 10,
                      alignment: "left",
                    },
                  ],
                },
                // Columna derecha
                {
                  width: "50%",
                  stack: [
                    {
                      text: `${venta?.tipo_venta || "N/A"}`,
                      fontSize: 10,
                      alignment: "right",
                    },
                    {
                      text: `Vencimiento: ${venta?.fecha_vencimiento || "N/A"}`,
                      fontSize: 10,
                      alignment: "right",
                    },
                    {
                      text: `Vendedor: ${venta?.vendedor || "Vendedor"}`,
                      fontSize: 10,
                      alignment: "right",
                    },
                    {
                      text: `Agente Venta: ${venta?.cajero || "admin"}`,
                      fontSize: 10,
                      alignment: "right",
                    },
                  ],
                },
              ],
            },
            // Tabla de productos
            {
              margin: [0, 10, 0, 0],
              table: {
                headerRows: 1,
                widths: ["auto", "*", "auto", "auto", "auto", "auto"],
                body: [
                  [
                    {
                      text: "Cód.Barra",
                      style: "tableHeader",
                      fontSize: 10,
                      bold: true,
                    },
                    {
                      text: "Descripción",
                      style: "tableHeader",
                      fontSize: 10,
                      bold: true,
                    },
                    {
                      text: "Cantidad",
                      style: "tableHeader",
                      fontSize: 10,
                      bold: true,
                    },
                    {
                      text: "Precio U.",
                      style: "tableHeader",
                      fontSize: 10,
                      bold: true,
                    },
                    {
                      text: "Descuento",
                      style: "tableHeader",
                      fontSize: 10,
                      bold: true,
                    },
                    {
                      text: "Subtotal",
                      style: "tableHeader",
                      fontSize: 10,
                      bold: true,
                    },
                  ],
                  ...detallesVenta.map((row) =>
                    row.map((cell, index) => ({
                      text: cell,
                      fontSize: 10,
                      alignment: index === 1 ? "left" : "right",
                    }))
                  ),
                ],
              },
              layout: {
                hLineWidth: function (i: number, node: any) {
                  return i === 0 || i === 1 || i === node.table.body.length
                    ? 1
                    : 0.5;
                },
                vLineWidth: function (i: number, node: any) {
                  return i === 0 || i === node.table.widths.length ? 1 : 0.5;
                },
                hLineColor: function (i: number, node: any) {
                  return i === 0 || i === 1 || i === node.table.body.length
                    ? "black"
                    : "gray";
                },
                vLineColor: function (i: number, node: any) {
                  return i === 0 || i === node.table.widths.length
                    ? "black"
                    : "gray";
                },
                hLineStyle: function () {
                  // Aplicar estilo dashed a todas las líneas, incluyendo bordes
                  return { dash: { length: 10, space: 4 } };
                },
                vLineStyle: function () {
                  // Aplicar estilo dashed a todas las líneas, incluyendo bordes
                  return { dash: { length: 4 } };
                },
              },
            },
            // Totales
            {
              columns: [
                {
                  width: "60%",
                  text: "",
                },
                {
                  width: "40%",
                  stack: [
                    {
                      columns: [
                        {
                          text: "SubTotal/Sin D:",
                          fontSize: 10,
                          alignment: "right",
                          width: "60%",
                        },
                        {
                          text: `${(
                            Number(venta?.subtotal) || 0
                          ).toLocaleString("es-PY")}`,
                          fontSize: 10,
                          alignment: "right",
                          width: "40%",
                        },
                      ],
                      margin: [0, 5, 0, 0],
                    },
                    {
                      columns: [
                        {
                          text: "SubTotal/Con D:",
                          fontSize: 10,
                          alignment: "right",
                          width: "60%",
                        },
                        {
                          text: `${(
                            Number(venta?.subtotal) || 0
                          ).toLocaleString("es-PY")}`,
                          fontSize: 10,
                          alignment: "right",
                          width: "40%",
                        },
                      ],
                      margin: [0, 2, 0, 0],
                    },
                    {
                      columns: [
                        {
                          text: "Descuento:",
                          fontSize: 10,
                          alignment: "right",
                          width: "60%",
                        },
                        {
                          text: `${(
                            Number(venta?.total_descuento) || 0
                          ).toLocaleString("es-PY")}`,
                          fontSize: 10,
                          alignment: "right",
                          width: "40%",
                        },
                      ],
                      margin: [0, 2, 0, 0],
                    },
                    {
                      columns: [
                        {
                          text: "Total:",
                          fontSize: 10,
                          alignment: "right",
                          bold: true,
                          width: "60%",
                        },
                        {
                          text: `${(
                            Number(venta?.total_a_pagar) || 0
                          ).toLocaleString("es-PY")}`,
                          fontSize: 10,
                          alignment: "right",
                          bold: true,
                          width: "40%",
                        },
                      ],
                      margin: [0, 2, 0, 0],
                    },
                  ],
                },
              ],
            },
            // Pie de nota
            {
              stack: [
                {
                  text: "<<Pasado las 48 hs. no se acepta mas devoluciones>>",
                  fontSize: 10,
                  alignment: "center",
                  margin: [0, 15, 0, 0],
                },
                {
                  columns: [
                    {
                      text: "<<Gracias por su preferencia>>",
                      fontSize: 10,
                      alignment: "left",
                    },
                    {
                      text: "<<Comprobante no válido como nota fiscal>>",
                      fontSize: 10,
                      alignment: "right",
                    },
                  ],
                  margin: [0, 15, 0, 0],
                },
              ],
            },
          ],
          styles: {
            header: {
              fontSize: 18,
              bold: true,
              margin: [0, 0, 0, 10],
            },
            tableHeader: {
              bold: true,
              fontSize: 10,
              color: "black",
            },
          },
        },
        "print"
      );

      toast({
        title: "PDF generado con éxito",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast({
        title: "Error al generar PDF",
        description: "Hubo un problema al generar el documento",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Effect para cargar datos
  useEffect(() => {
    const init = async () => {
      if (id_venta) {
        try {
          console.log("Iniciando carga de datos para venta:", id_venta);
          await getConfiguraciones();
          await getVenta();
          console.log("Datos cargados exitosamente");
        } catch (error) {
          console.error("Error cargando datos:", error);
          toast({
            title: "Error",
            description: "No se pudieron cargar los datos",
            status: "error",
            duration: 3000,
          });
        }
      }
    };

    init();
  }, [id_venta]);

  // Effect para manejar la impresión
  useEffect(() => {
    const imprimirSiDatosListos = async () => {
      console.log("Verificando condiciones para imprimir:", {
        onImprimir,
        prevOnImprimir,
        tieneVenta: !!venta,
        tieneConfiguraciones: !!configuraciones,
        datosVenta: venta,
      });

      // Solo intentar imprimir si:
      // 1. onImprimir es true
      // 2. No se ha impreso antes (prevOnImprimir es false)
      // 3. Tenemos todos los datos necesarios
      if (onImprimir && !prevOnImprimir && venta && configuraciones) {
        try {
          console.log("Iniciando generación de PDF");
          // Esperar a que se complete la generación del PDF
          await generarPDF();
          console.log("PDF generado exitosamente");

          // Actualizar el estado después de una impresión exitosa
          setPrevOnImprimir(true);
        } catch (error) {
          console.error("Error generando PDF:", error);
          toast({
            title: "Error",
            description: "Error al generar el PDF",
            status: "error",
            duration: 3000,
          });
        }
      }
    };

    imprimirSiDatosListos();
  }, [onImprimir, venta, configuraciones]);

  // Effect para resetear el estado cuando cambia id_venta
  useEffect(() => {
    setPrevOnImprimir(false);
  }, [id_venta]);

  const getConfiguraciones = async () => {
    try {
      const response = await axios.get(`${api_url}configuraciones/todos`);
      setConfiguraciones(response.data.body);
    } catch (error) {
      console.error("Error al obtener las configuraciones:", error);
    }
  };

  const getVenta = async () => {
    try {
      const response = await axios.get(`${api_url}venta/venta-imprimir`, {
        params: {
          ventaId: id_venta,
        },
      });
      console.log(response.data.body);
      setVenta(response.data.body);
    } catch (error) {
      console.error("Error al obtener la venta:", error);
    }
  };

  return <div id="ticket"></div>;
};

export default ModeloNotaComun;
