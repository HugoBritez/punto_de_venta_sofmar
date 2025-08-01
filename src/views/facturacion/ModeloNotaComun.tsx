import { Configuraciones } from "@/shared/types/shared_interfaces";
import axios from "axios";
import { api_url } from "@/utils";
import { useState, useEffect } from "react";
import {  useToast } from "@chakra-ui/react";
import { generatePDF } from "@/shared/services/pdfService";

interface ModeloNotaComunProps {
  id_venta?: number;
  monto_entregado?: number;
  monto_recibido?: number;
  vuelto?: number;
  onImprimir?: boolean;
  accion?: "print" | "download" | "b64";
}

interface VentaTicket {
  codigo: number;
  tipoVenta: string;
  fechaVenta: string;
  fechaVencimiento: string;
  cajero: string;
  vendedor: string;
  cliente: string;
  clienteCorreo: string;
  direccion: string;
  telefono: string;
  ruc: string;
  subtotal: number;
  totalDescuento: number;
  totalAPagar: number;
  totalExentas: number;
  totalDiez: number;
  totalCinco: number;
  timbrado: string;
  factura: string;
  facturaValidoDesde: string;
  facturaValidoHasta: string;
  veQr?: string;
  veCdc: string;
  usaFe: number;
  moneda: string;
  cotizacion: number;
  deposito: string;
  observacion: string;
  detalles: {
    codigo: number;
    descripcion: string;
    cantidad: number;
    precio: number;
    total: number;
    exentas: number;
    diez: number;
    cinco: number;
    fechaVencimiento: string;
    lote: string;
    controlVencimiento: number;
  }[];
  sucursalData: {
    sucursalNombre: string;
    sucursalDireccion: string;
    sucursalTelefono: string;
    sucursalEmpresa: string;
    sucursalRuc: string;
    sucursalMatriz: string;
    sucursalCorreo: string;
    sucursalCiudad: string;
  }[];
}

const ModeloNotaComun = ({
  id_venta,
  onImprimir = false,
  accion = "print",
}: ModeloNotaComunProps) => {
  const [venta, setVenta] = useState<VentaTicket | null>(null);
  const [configuraciones, setConfiguraciones] = useState<
    Configuraciones[] | null
  >(null);
  const [prevOnImprimir, setPrevOnImprimir] = useState(false);
  const toast = useToast();

  // const fechaActual = new Date().toLocaleDateString("es-PY", {
  //   day: "2-digit",
  //   month: "2-digit",
  //   year: "numeric",
  //   hour: "2-digit",
  //   minute: "2-digit",
  //   second: "2-digit",
  //   hour12: true,
  // });

  const generarPDF = async (tipoSalida: "print" | "download" | "b64" = "print") => {
    try {
      console.log("empezando a generar pdf, acción:", tipoSalida);
      
      // Verificar si tenemos los datos necesarios
      if (!venta || !venta.detalles) {
        throw new Error("No hay datos de venta o detalles disponibles");
      }

      const detallesVenta = venta.detalles.map((detalle) => [
        detalle.codigo.toString(),
        detalle.descripcion,
        detalle.cantidad.toString(),
        `${(Number(detalle.precio) || 0).toLocaleString("es-PY")}`,
        detalle.total
          ? `${Number(detalle.total).toLocaleString("es-PY")}`
          : "0",
      ]);
      
      // Asegurar altura mínima de 5.5 cm (aproximadamente 8-10 filas)
      const minFilasRequeridas = 10;
      const filasActuales = detallesVenta.length;
      
      // Si tenemos menos filas que el mínimo, añadir filas vacías
      if (filasActuales < minFilasRequeridas) {
        const filasVaciasNecesarias = minFilasRequeridas - filasActuales;
        for (let i = 0; i < filasVaciasNecesarias; i++) {
          detallesVenta.push(["", "", "", "", "", ""]);
        }
      }

      // Crear un nombre de archivo basado en los datos de venta
      const nombreArchivo = tipoSalida === "download" 
        ? `Nota_Comun_${venta?.codigo || 'venta'}_${new Date().toISOString().split('T')[0]}.pdf` 
        : undefined;

      await generatePDF(
        {
          pageSize: { width: 595.28, height: 841.89 },
          pageMargins: [10, 10, 10, 10],
          info: {
            title: `Nota ${venta?.codigo}`,
            author: "Sistema de Ventas",
            subject: "Nota de Venta",
            keywords: "venta, nota",
          },
          content: [
            {
              canvas: [
                {
                  type: "line", 
                  x1: 0,
                  y1: 0, 
                  x2: 595.28,
                  y2: 0, 
                  dash: { length: 4, space: 3 }, 
                  lineWidth: 1, 
                },
              ],
            },
            //cabecera
            {
              columns: [
                {
                  stack: [
                    {
                      text: `Usuario: ${sessionStorage.getItem("user_name")}`,
                      fontSize: 10,
                    },
                    {
                      text: `Filial: ${venta?.sucursalData[0].sucursalEmpresa}`,
                      fontSize: 10,
                    },
                  ],
                },
                {
                  stack: [
                    {
                      text: `CONTROL INTERNO`,
                      fontSize: 10,
                    },
                    {
                      text: `Ciudad: ${venta?.sucursalData[0].sucursalCiudad}`,
                      fontSize: 10,
                    },
                  ],
                },
                {
                  stack: [
                    {
                      text: `Venta: ${venta?.tipoVenta}`,
                      fontSize: 10,
                    },
                    {
                      text: `Telefono: ${venta?.sucursalData[0].sucursalTelefono}`,
                      fontSize: 10,
                    },
                  ],
                },
              ],
              margin: [0, 10, 0, 10],
              fontSize: 10,
            },
            {
              canvas: [
                {
                  type: "line", // Tipo: línea
                  x1: 0,
                  y1: 0, // Punto de inicio
                  x2: 595.28,
                  y2: 0, // Punto final (ancho de la línea)
                  dash: { length: 4, space: 3 }, // Patrón de puntos
                  lineWidth: 1, // Grosor de la línea
                },
              ],
            },
            {
              columns: [
                {
                  stack: [
                    {
                      text: `Fecha: ${venta?.fechaVenta}`,
                      fontSize: 10,
                    },
                    {
                      text: `Moneda: ${venta?.moneda}`,
                      fontSize: 10,
                    },
                    {
                      text: `Cliente: ${venta?.cliente}`,
                      fontSize: 10,
                    },
                    {
                      text: `RUC: ${venta?.ruc}`,
                      fontSize: 10,
                    },
                  ],
                },
                {
                  stack: [
                    {
                      text: `Deposito: ${venta?.deposito}`,
                      fontSize: 10,
                    },
                    {
                      text: `Vendedor: ${venta?.vendedor}`,
                      fontSize: 10,
                    },
                    {
                      text: `Ciudad: ${venta?.sucursalData[0].sucursalCiudad}`,
                      fontSize: 10,
                    },
                    {
                      text: `Direccion: ${venta?.direccion}`,
                      fontSize: 10,
                    },
                  ],
                },
                {
                  stack: [
                    {
                      text: `Registro: 0000${id_venta}`,
                      fontSize: 10,
                    },
                    {
                      text: `Sucursal: ${venta?.sucursalData[0].sucursalNombre}`,
                      fontSize: 10,
                    },
                    {
                      text: `Telefono: ${venta?.sucursalData[0].sucursalTelefono}`,
                      fontSize: 10,
                    },
                    {
                      text: `Ag. Venta: ${venta?.cajero}`,
                      fontSize: 10,
                    },
                  ],
                },
              ],
              margin: [0, 10, 0, 0],
              fontSize: 10,
            },
            {
              table: {
                headerRows: 1,
                widths: ["10%", "*", "12%", "12%", "12%", "15%"],
                body: [
                  [
                    "Cod. Barra",
                    "Producto",
                    "Cantidad",
                    "Precio U.",
                    "Descuento",
                    "Valor",
                  ],
                  ...detallesVenta,
                ],
              },
              margin: [0, 10, 0, 10],
              fontSize: 10,
              layout: {
                hLineWidth: function (i: number, node: any) {
                  return i === 0 || i === 1 || i === node.table.body.length ? 1 : 0;
                },
                vLineWidth: function () {
                  return 0;
                },
                hLineStyle: function () {
                  return { dash: { length: 4, space: 3 } };
                },
                paddingLeft: function () {
                  return 0;
                },
                paddingRight: function () {
                  return 0;
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
              stack: [
                {
                  columns: [
                    {
                      text: `Items: ${venta?.detalles.length}`,
                      fontSize: 10,
                    },
                    {
                      text: `Obs: ${venta?.observacion}`,
                      fontSize: 10,
                    },
                  ],
                },
                {
                  columns: [
                    {
                      text: `Cot: ${Number(venta?.cotizacion).toLocaleString("es-PY")}`,
                      fontSize: 10,
                    },
                    {
                      text: `Total US$: ${Number((venta?.totalAPagar || 0) / (venta?.cotizacion || 0)).toFixed(3)}`,
                      fontSize: 10,
                    },
                    {
                      text: `SubTotal/sin. Desc: ${Number(venta?.subtotal || 0).toLocaleString("es-PY")}`,
                      fontSize: 10,
                    },
                    {
                      text: `SubTotal/con. Desc: ${(Number(venta?.totalAPagar || 0).toLocaleString("es-PY"))}`,
                      fontSize: 10,
                      alignment: "right",
                    },
                  ],
                },
                {
                  columns: [
                    {
                      text: "<< Pasadas las 48 hs. no se aceptan devoluciones >>",
                      fontSize: 10,
                      width: "*"
                    },
                    {
                      text: `(-) Descuento: ${Number(venta?.totalDescuento).toLocaleString("es-PY")}`,
                      fontSize: 10,
                      alignment: "right",
                      width: "*"
                    },
                  ],
                },
                {
                  columns: [
                    {
                      text: "<< Gracias por su preferencia >>",
                      fontSize: 10,
                      width: "*"
                    },
                    {
                      text: `Vlr. Liquido: ${Number(venta?.totalAPagar).toLocaleString("es-PY")}`,
                      fontSize: 10,
                      alignment: "right",
                      width: "*"
                    },
                  ],
                },
                {
                  columns: [
                    {
                      text: "<< Comprobante no valido para nota fiscal >>",
                      fontSize: 10,
                    },
                    {
                      text: `Firma: ___________________________`,
                      fontSize: 10,
                    },
                  ],
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
      if (!id_venta) {
        throw new Error("ID de venta no proporcionado");
      }

      const response = await axios.get(`${api_url}venta/imprimir`, {
        params: {
          venta: id_venta,
        },
      });

      if (!response.data || !response.data.body) {
        throw new Error("La respuesta de la API no contiene datos válidos");
      }

      const ventaData = response.data.body;
      
      // Validar que los datos requeridos estén presentes
      if (!ventaData.detalles || !Array.isArray(ventaData.detalles)) {
        throw new Error("Los detalles de la venta no están disponibles o no son válidos");
      }

      console.log("Datos de venta recibidos:", ventaData);
      setVenta(ventaData);
    } catch (error) {
      console.error("Error al obtener la venta:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de la venta",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      throw error; // Re-lanzar el error para que sea manejado por el useEffect
    }
  };


  return <div id="ticket"></div>;
};

export default ModeloNotaComun;
