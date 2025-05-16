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
  timbrado: string;
  factura: string;
  factura_valido_desde: string;
  factura_valido_hasta: string;
  ve_qr?: string;
  ve_cdc: string;
  usa_fe: number;
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

const ModeloFacturaNuevo = ({
  id_venta,
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

  const formatNumber = (number: number) => {
    // Verificar que el valor sea un número válido
    const validNumber =
      typeof number === "number" && !isNaN(number) ? number : 0;
    return validNumber
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      .replace(".", ",");
  };

  

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
        ? `Factura_${venta?.factura || venta?.codigo || 'venta'}_${new Date().toISOString().split('T')[0]}.pdf` 
        : undefined;

      // Crear el contenido base del PDF
      const contenidoPDF = [
        {
          text: venta?.sucursal_data[0].sucursal_empresa,
          style: "header",
          alignment: "center",
          fontSize: 18,
        },
        {
          text: `RUC: ${venta?.sucursal_data[0].sucursal_ruc}`,
          style: "text",
          alignment: "center",
          fontSize: 16,
        },
        {
          text: `${venta?.sucursal_data[0].sucursal_matriz} :${venta?.sucursal_data[0].sucursal_direccion}`,
          style: "text",
          alignment: "center",
          fontSize: 16,
        },
        {
          text: `Telefono: ${venta?.sucursal_data[0].sucursal_telefono}`,
          style: "text",
          alignment: "center",
          fontSize: 16,
        },
        { text: "\n" },
        {
          text: "------------------------------------------------------------------------------------",
          style: "text",
          fontSize: 14,
        },
        {
          text: `Timbrado: ${venta?.timbrado}`,
          style: "text",
          alignment: "center",
          fontSize: 16,
        },
        {
          text: `Valido desde: ${venta?.factura_valido_desde}`,
          style: "text",
          alignment: "center",
          fontSize: 16,
        },
        {
          text: `Valido hasta: ${venta?.factura_valido_hasta}`,
          style: "text",
          alignment: "center",
          fontSize: 16,
        },
        {
          text: `FACTURA ${venta?.tipo_venta}`,
          style: "tHeaderValue",
          alignment: "center",
          fontSize: 16,
        },
        {
          text: `Nro: ${venta?.factura}`,
          style: "text",
          alignment: "center",
          fontSize: 16,
        },
        {
          text: ` *** IVA INCLUIDO ***`,
          style: "text",
          alignment: "center",
          fontSize: 16,
        },
        {
          text: "------------------------------------------------------------------------------------",
          style: "text",
          fontSize: 14,
        },
        {
          text: `Fecha Emision: ${fechaActual}`,
          style: "text",
          alignment: "center",
          fontSize: 16,
        },
        {
          text: `Cajero: ${venta?.cajero}`,
          style: "text",
          alignment: "center",
          fontSize: 16,
        },
        {
          text: `Cliente: ${venta?.cliente}`,
          style: "text",
          alignment: "center",
          fontSize: 16,
        },
        {
          text: `RUC: ${venta?.ruc}`,
          style: "text",
          alignment: "center",
          fontSize: 16,
        },
        {
          text: `Dirección: ${venta?.direccion}`,
          style: "text",
          alignment: "center",
          fontSize: 16,
        },
        {
          text: `Teléfono: ${venta?.telefono}`,
          style: "text",
          alignment: "center",
          fontSize: 16,
        },
        { text: "\n" },
        {
          text: "------------------------------------------------------------------------------------",
          style: "text",
          fontSize: 14,
        },
        {
          table: {
            headerRows: 1,
            widths: ["*", "auto", "auto", "auto"],
            body: [
              [
                {
                  text: "Artículo",
                  style: "tProductsHeader",
                  fontSize: 16,
                },
                { text: "Cant.", style: "tProductsHeader", fontSize: 16 },
                { text: "Precio", style: "tProductsHeader", fontSize: 16 },
                { text: "Total", style: "tProductsHeader", fontSize: 16 },
              ],
              ...detallesVenta.map((row) =>
                row.map((cell) => ({
                  text: cell,
                  style: "tProductsBody",
                  fontSize: 16,
                }))
              ),
            ],
          },
          layout: "noBorders",
        },
        { text: "\n" },
        {
          text: "------------------------------------------------------------------------------------",
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
                    { text: "GRAN TOTAL:", style: "tTotals", fontSize: 16 },
                    {
                      text: `${(
                        Number(venta?.subtotal) || 0
                      ).toLocaleString("es-PY")} Gs.`,
                      style: "tTotals",
                      fontSize: 16,
                    },
                  ],
                  [
                    { text: "DESCUENTO:", style: "tTotals", fontSize: 16 },
                    {
                      text: `${(
                        Number(venta?.total_descuento) || 0
                      ).toLocaleString("es-PY")} Gs.`,
                      style: "tTotals",
                      fontSize: 16,
                    },
                  ],
                  [
                    {
                      text: "TOTAL A PAGAR:",
                      style: "tTotals",
                      fontSize: 16,
                    },
                    {
                      text: `${(
                        Number(venta?.total_a_pagar) || 0
                      ).toLocaleString("es-PY")} Gs.`,
                      style: "tTotals",
                      fontSize: 16,
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
          ],
        },
        {
          text: "------------------------------------------------------------------------------------",
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
                    {
                      text: "Monto recibido:",
                      style: "tTotals",
                      fontSize: 16,
                    },
                    {
                      text: `${(Number(monto_recibido) || 0).toLocaleString(
                        "es-PY"
                      )} Gs.`,
                      style: "tTotals",
                      fontSize: 16,
                    },
                  ],
                  [
                    { text: "Vuelto:", style: "tTotals", fontSize: 16 },
                    {
                      text: `${(Number(vuelto) || 0).toLocaleString(
                        "es-PY"
                      )} Gs.`,
                      style: "tTotals",
                      fontSize: 16,
                    },
                  ],
                ],
              },
              layout: "noBorders",
            },
          ],
        },
        {
          text: "------------------------------------------------------------------------------------",
          style: "text",
          fontSize: 14,
        },
        { text: "DETALLE LIQUIDACION IVA", style: "text", fontSize: 16 },
        {
          text: "------------------------------------------------------------------------------------",
          style: "text",
          fontSize: 14,
        },
        { text: "\n" },
        {
          table: {
            widths: ["60%", "40%"],
            body: [
              [
                {
                  text: "T. Exentas:",
                  fontSize: 16,
                  alignment: "left",
                },
                {
                  text: `Gs. ${formatNumber(
                    Number(venta?.total_exentas) || 0
                  )}`,
                  fontSize: 16,
                  alignment: "right",
                },
              ],
              [
                {
                  text: "T. Gravadas 10%:",
                  fontSize: 16,
                  alignment: "left",
                },
                {
                  text: `Gs. ${formatNumber(
                    Number(venta?.total_diez) || 0
                  )}`,
                  fontSize: 16,
                  alignment: "right",
                },
              ],
              [
                {
                  text: "T. Gravadas 5%:",
                  fontSize: 16,
                  alignment: "left",
                },
                {
                  text: `Gs. ${formatNumber(
                    Number(venta?.total_cinco) || 0
                  )}`,
                  fontSize: 16,
                  alignment: "right",
                },
              ],
              [
                {
                  text: "Liq. IVA 5%:",
                  fontSize: 16,
                  alignment: "left",
                },
                {
                  text: `Gs. ${
                    venta?.total_cinco
                      ? formatNumber(Number(venta.total_cinco) / 22)
                      : 0
                  }`,
                  fontSize: 16,
                  alignment: "right",
                },
              ],
              [
                {
                  text: "Liq. IVA 10%:",
                  fontSize: 16,
                  alignment: "left",
                },
                {
                  text: `Gs. ${
                    venta?.total_diez
                      ? formatNumber(Number(venta.total_diez) / 11)
                      : 0
                  }`,
                  fontSize: 16,
                  alignment: "right",
                },
              ],
              [
                {
                  text: "Total Liq. IVA:",
                  fontSize: 16,
                  alignment: "left",
                },
                {
                  text: `Gs. ${formatNumber(
                    (venta?.total_cinco
                      ? Number(venta.total_cinco) / 22
                      : 0) +
                      (venta?.total_diez
                        ? Number(venta.total_diez) / 11
                        : 0)
                  )}`,
                  fontSize: 16,
                  alignment: "right",
                },
              ],
            ],
          },
          layout: "noBorders",
        },
        {
          text: "------------------------------------------------------------------------------------",
          style: "text",
          fontSize: 14,
        },
        {
          text: "***GRACIAS POR SU PREFERENCIA***",
          style: "text",
          fontSize: 16,
          alignment: "center",
        },
        {
          text: "ORIGINAL CLIENTE",
          style: "text",
          fontSize: 16,
          alignment: "center",
        },
        {
          text: "DUPLICADO ARCHIVO TRIBUTARIO",
          style: "text",
          fontSize: 16,
          alignment: "center",
        },
        {
          text: "------------------------------------------------------------------------------------",
          style: "text",
          fontSize: 14,
        },
      ];

      // Agregar contenido condicional para factura electrónica
      if (venta?.usa_fe === 1) {
        contenidoPDF.push(
          { text: "\n" },
          venta?.ve_qr && venta.ve_qr !== "" ? 
          {
            qr: venta.ve_qr,
            fit: 300,
            alignment: "center",
          } as any : 
          {
            text: "FACTURA EN PROCESO DE VALIDACIÓN",
            fontSize: 16,
            bold: true,
            alignment: "center",
            margin: [0, 30, 0, 30],
          },
          { text: "\n" },
          {
            text: "Consulte esta Factura Electrónica con el número impreso abajo:",
            style: "text",
            fontSize: 16,
            alignment: "center",
          },
          { text: "\n" },
          {
            text: `https://ekuatia.set.gov.py/consultas/${venta.ve_cdc}`,
            style: "text",
            fontSize: 16,
            alignment: "center",
          },
          { text: "\n" },
          {
            text: `ESTE DOCUMENTO ES UNA REPRESENTACIÓN GRÁFICA DE UN DOCUMENTO ELECTRÓNICO (XML)`,
            style: "text",
            fontSize: 12,
            alignment: "center",
            bold: true,
          } as any,
          { text: "\n" },
          {
            text: `Si su documento electronico presenta algun error solicitar la modificacion dentro de las 48 horas siguientes de la emision de este comprobante.`,
            style: "text",
            fontSize: 12,
            alignment: "center",
            bold: true,
          } as any
        );
      }

      // Generar el PDF con el contenido preparado
      await generatePDF(
        {
          pageSize: {
            width: 350,
            height: "auto",
          },
          pageMargins: [0, 0, 10, 0],
          info: {
            title: `Factura ${venta?.codigo}`,
            author: "Sistema de Ventas",
            subject: "Factura de Venta",
            keywords: "venta, factura",
          },
          content: contenidoPDF,
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

export default ModeloFacturaNuevo;
