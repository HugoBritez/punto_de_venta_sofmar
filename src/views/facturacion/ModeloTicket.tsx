import { Configuraciones } from "@/shared/types/shared_interfaces";
import axios from "axios";
import { api_url } from "@/utils";
import { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { generatePDF } from "@/shared/services/pdfService";

interface ModeloTicketProps {
  id_venta?: number;
  monto_entregado?: number;
  monto_recibido?: number;
  vuelto?: number;
  onImprimir?: boolean;
  accion?: "print" | "download" | "b64";
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
  detalles: {
    codigo: number;
    descripcion: string;
    cantidad: number;
    precio: number;
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

const ModeloTicket = ({
  id_venta = 134812,
  monto_recibido = 0,
  vuelto = 0,
  onImprimir = false,
  accion = "print",
}: ModeloTicketProps) => {
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

const generarPDF = async (tipoSalida: "print" | "download" | "b64" = "print") => {
  try {
    // Asegurarse de que los detalles existan y tengan el formato correcto
    const detallesVenta =
      venta?.detalles.map((detalle) => [
        detalle.descripcion,
        detalle.cantidad.toString(),
        // Asegurarse de que los números sean válidos antes de formatearlos
        `${(Number(detalle.precio) || 0).toLocaleString("es-PY")} Gs.`,
        `${(Number(detalle.total) || 0).toLocaleString("es-PY")} Gs.`,
      ]) || [];

    // Crear un nombre de archivo descriptivo para descargas
    const nombreArchivo = tipoSalida === "download" 
      ? `Ticket_${venta?.codigo || 'venta'}_${new Date().toISOString().split('T')[0]}.pdf` 
      : undefined;

    await generatePDF(
      {
        pageSize: {
          width: 226.77,
          height: "auto",
        },
        pageMargins: [0, 0, 0, 0],
        info: {
          title: `Ticket ${venta?.codigo}`,
          author: "Sistema de Ventas",
          subject: "Ticket de Venta",
          keywords: "venta, ticket",
        },
        content: [
          {
            text: venta?.sucursal_data[0].sucursal_empresa,
            style: "header",
            alignment: "center",
            fontSize: 16,
          },
          {
            text: `RUC: ${venta?.sucursal_data[0].sucursal_ruc}`,
            style: "text",
            alignment: "center",
            fontSize: 16,
          },

          { text: "\n" },
          {
            text: "--------------------------------------------------------",
            style: "text",
            fontSize: 14,
          },
          {
            columns: [
              {
                text: fechaActual,
                style: "text",
                alignment: "center",
              },
              {
                text: `Venta Nro: ${venta?.codigo}`,
                style: "tHeaderValue",
                alignment: "center",
              },
              {
                text: `C. Venta: ${venta?.tipo_venta}`,
                style: "tHeaderValue",
                alignment: "center",
              },
            ],
          },
          {
            text: `Vencimiento: ${venta?.fecha_vencimiento}`,
            style: "text",
            alignment: "center",
          },
          {
            text: `Cajero: ${venta?.cajero}`,
            style: "text",
            alignment: "center",
          },
          {
            text: `Vendedor: ${venta?.vendedor}`,
            style: "text",
            alignment: "center",
          },
          {
            text: `Cliente: ${venta?.cliente}`,
            style: "text",
            alignment: "center",
          },
          {
            text: `Dirección: ${venta?.direccion}`,
            style: "text",
            alignment: "center",
          },
          {
            text: `Teléfono: ${venta?.telefono}`,
            style: "text",
            alignment: "center",
          },
          {
            text: "--------------------------------------------------------",
            style: "text",
            fontSize: 14,
          },
          { text: "\n" },
          {
            table: {
              headerRows: 1,
              widths: ["*", "auto", "auto", "auto"],
              body: [
                [
                  { text: "Artículo", style: "tProductsHeader" },
                  { text: "Cant.", style: "tProductsHeader" },
                  { text: "Precio", style: "tProductsHeader" },
                  { text: "Total", style: "tProductsHeader" },
                ],
                ...detallesVenta.map((row) =>
                  row.map((cell) => ({ text: cell, style: "tProductsBody" }))
                ),
              ],
            },
            layout: "noBorders",
          },
          { text: "\n" },
          {
            text: "--------------------------------------------------------",
            style: "text",
            fontSize: 14,
          },
          { text: "\n" },
          {
            alignment: "right",
            columns: [
              {},
              {
                width: "auto",
                table: {
                  body: [
                    [
                      { text: "Subtotal:", style: "tTotals" },
                      {
                        text: `${(Number(venta?.subtotal) || 0).toLocaleString(
                          "es-PY"
                        )} Gs.`,
                        style: "tTotals",
                      },
                    ],
                    [
                      { text: "Descuento:", style: "tTotals" },
                      {
                        text: `${(
                          Number(venta?.total_descuento) || 0
                        ).toLocaleString("es-PY")} Gs.`,
                        style: "tTotals",
                      },
                    ],
                    [
                      { text: "Total a pagar:", style: "tTotals" },
                      {
                        text: `${(
                          Number(venta?.total_a_pagar) || 0
                        ).toLocaleString("es-PY")} Gs.`,
                        style: "tTotals",
                      },
                    ],
                  ],
                },
                layout: "noBorders",
              },
            ],
          },
          { 
            text: "--------------------------------------------------------",
            style: "text",
            fontSize: 14,
          },
          {
            alignment: "right",
            columns: [
              {},
              {
                width: "auto",
                table: {
                  body: [
                    [
                      { text: "Monto recibido:", style: "tTotals" },
                      {
                        text: `${(Number(monto_recibido) || 0).toLocaleString(
                          "es-PY"
                        )} Gs.`,
                        style: "tTotals",
                      },
                    ],
                    [
                      { text: "Vuelto:", style: "tTotals" },
                      {
                        text: `${(Number(vuelto) || 0).toLocaleString(
                          "es-PY"
                        )} Gs.`,
                        style: "tTotals",
                      },
                    ],
                  ],
                },
                layout: "noBorders",
              },
            ],
          },
          { text: "\n" },
          {
            text: "--------------------------------------------------------",
            style: "text",
            fontSize: 14,
          },
          { text: "\n" },
          {
            text: "<<<No válido como comprobante fiscal>>>",
            style: "text",
            alignment: "center",
          },
          {
            text: "<<<Pasadas las 24hs, no se aceptan cambios ni devoluciones>>>",
            style: "text",
            alignment: "center",
          },
          { text: "<<<Gracias por su compra>>>", style: "text", alignment: "center" },
        ],
      },
      tipoSalida,
      nombreArchivo
    );

    toast({
      title: tipoSalida === "print" ? "PDF impreso con éxito" : "PDF generado con éxito",
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
          await generarPDF(accion);
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
  }, [onImprimir, venta, configuraciones, accion]);

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

export default ModeloTicket;
