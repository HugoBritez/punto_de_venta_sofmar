import { FiltrosDTO, ReporteIngresos } from "../types/shared.type";
import { useIngresos } from "../hooks/useIngresos";
import { generatePDF } from "@/shared/services/pdfService";
import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { Configuraciones } from "@/shared/types/shared_interfaces";
import axios from "axios";
import { api_url } from "../../../../utils";
interface ReporteIngresosProps {
    filtros: FiltrosDTO
    onComplete?: () => void;
    onError?: (error: any) => void;
    action?: "print" | "download";
}

const ReporteIngresosComponent = ({filtros, onComplete, onError, action}: ReporteIngresosProps) => {
    const { generarReporteIngresos, reporteIngresos} = useIngresos();
    const [configuracionesEmpresa, setConfiguracionesEmpresa] = useState<
      Configuraciones[]
    >([]);

    const nombreEmpresa = configuracionesEmpresa[0]?.valor || "N/A";
    const rucEmpresa = configuracionesEmpresa[30]?.valor || "N/A";
    const fechaCompletaActual = new Date().toLocaleString();
    
    const toast = useToast();

    const fetchConfiguraciones = async () => {
      try {
        const response = await axios.get(`${api_url}configuraciones/todos`);
        setConfiguracionesEmpresa(response.data.body);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Error al cargar las configuraciones de la empresa",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    useEffect(() => {
        console.log("Fetching configuraciones")
      fetchConfiguraciones();
    }, []);

    const NombreTipoIngreso = (tipo: number) => {
        switch (tipo) {
            case -1:
                return "Todos";
            case 0:
                return "Sin Verificar";
            case 1:
                return "Verificado";
            case 2:
                return "Confirmado";
            default:
                return "Desconocido";
        }
    }


    const generarPDF = async (data: ReporteIngresos[]) => {
        if (!data || data.length === 0) {
            toast({
                title: "Error al generar PDF",
                description: "No hay datos disponibles para generar el reporte",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            // Formatear fecha actual para el nombre del archivo
            const fecha = new Date().toISOString().split('T')[0];
            const nombreArchivo = `informe_ingresos_${fecha}`;

            const docDefinition = {
              pageSize: "A4",
              pageMargins: [20, 20, 20, 20],
              name: nombreArchivo,
              content: [
                // Encabezado
                {
                  columns: [
                    { text: `RUC: ${rucEmpresa}`, width: "*", fontSize: 8 },
                    {
                      text: nombreEmpresa,
                      alignment: "center",
                      width: "*",
                      fontSize: 8,
                    },
                    {
                      stack: [
                        {
                          text: fechaCompletaActual,
                          alignment: "right",
                          width: "*",
                          fontSize: 8,
                        },
                        {
                          text: sessionStorage.getItem("user_name"),
                          alignment: "right",
                          width: "*",
                          fontSize: 8,
                        },
                      ],
                    },
                  ],
                },
                // Línea separadora
                {
                  canvas: [{ type: "line", x1: 0, y1: 0, x2: 595, y2: 0 }],
                },
                {
                  text: "INFORME DE CONTROL DE INGRESOS",
                  alignment: "center",
                  fontSize: 10,
                  bold: true,
                  margin: [0, 10],
                },
                {
                  columns: [
                    {
                      text: `Fecha desde: ${filtros.fecha_desde}`,
                      width: "*",
                      fontSize: 8,
                    },
                    {
                      text: `Fecha hasta: ${filtros.fecha_hasta}`,
                      width: "*",
                      fontSize: 8,
                    },
                    {
                      text: `Estado de verificación: ${NombreTipoIngreso(
                        filtros.verificado
                      )}`,
                      width: "*",
                      fontSize: 8,
                    },
                    {
                      text: `Por factura: ${filtros.nro_factura === '' ? 'Todos' : filtros.nro_factura}`,
                      width: "*",
                      fontSize: 8,
                    },
                  ],
                  margin: [0, 10],
                },
                {
                  canvas: [{ type: "line", x1: 0, y1: 0, x2: 595, y2: 0 }],
                },
                // Contenido principal - Items agrupados
                ...data
                  .map((ingreso) => [
                    // Encabezado del ingreso con fondo azul
                    {
                      table: {
                        widths: ["*"],
                        body: [
                          [
                            {
                              columns: [
                                {
                                  text: `Ingreso #${ingreso.id_compra}`,
                                  fontSize: 9,
                                  bold: true,
                                  width: "*",
                                },
                                {
                                  text: `Fecha: ${ingreso.fecha_compra}`,
                                  fontSize: 8,
                                  alignment: "right",
                                  width: "*",
                                },
                              ],
                              fillColor: "#1e40af",
                              color: "white",
                              padding: [5, 3, 5, 3],
                            },
                          ],
                        ],
                      },
                      layout: "noBorders",
                      margin: [0, 10, 0, 0],
                    },
                    // Información principal
                    {
                      table: {
                        widths: ["*", "*", "*", "*"],
                        body: [
                          [
                            {
                              text: `Proveedor: ${ingreso.proveedor}`,
                              fontSize: 8,
                            },
                            {
                              text: `Factura: ${ingreso.nro_factura === '' ? 'N/A' : ingreso.nro_factura}`,
                              fontSize: 8,
                            },
                            {
                              text: `Depósito Origen: ${ingreso.deposito_descripcion}`,
                              fontSize: 8,
                            },
                          ],
                        ],
                      },
                      layout: "noBorders",
                      margin: [0, 5],
                    },
                    // Estado y responsable
                    {
                      table: {
                        widths: ["*", "*", "*", "*"],
                        body: [
                          [
                            {
                              text: `Estado: ${ingreso.estado}`,
                              fontSize: 8,
                              color:
                                ingreso.estado === "VERIFICADO"
                                  ? "green"
                                  : "black",
                              bold: true,
                            },
                            {
                              text: `Responsable Ubicación: ${ingreso.responsable_ubicacion}`,
                              fontSize: 8,
                            },
                            {
                              text: `Responsable Verificación: ${ingreso.responsable_verificacion}`,
                              fontSize: 8,
                            },
                            {
                              text: `Responsable Confirmación: ${ingreso.responsable_confirmacion}`,
                              fontSize: 8,
                            },
                          ],
                        ],
                      },
                      layout: "noBorders",
                      margin: [0, 0, 0, 5],
                    },
                    // Tabla de items con encabezado azul
                    {
                      table: {
                        headerRows: 1,
                        widths: [
                          "auto",
                          "auto",
                          "*",
                          "auto",
                          "auto",
                          "auto",
                          "auto",
                        ],
                        body: [
                          // Encabezados
                          [
                            { text: "Código", style: "subTableHeader" },
                            { text: "Código Barras", style: "subTableHeader" },
                            { text: "Descripción", style: "subTableHeader" },
                            {
                              text: "Cant.",
                              style: "subTableHeader",
                              alignment: "center",
                            },
                            {
                              text: "Verificada",
                              style: "subTableHeader",
                              alignment: "center",
                            },
                            { text: "Lote", style: "subTableHeader" },
                            { text: "Vencimiento", style: "subTableHeader" },
                          ],
                          // Filas de items
                          ...ingreso.items.map((item) => [
                            { text: item.articulo_id.toString(), fontSize: 8 },
                            { text: item.articulo_codigo_barras, fontSize: 8 },
                            { text: item.articulo_descripcion, fontSize: 8 },
                            {
                              text: item.cantidad.toString(),
                              fontSize: 8,
                              alignment: "center",
                            },
                            {
                              text: item.cantidad_verificada.toString(),
                              fontSize: 8,
                              alignment: "center",
                              color:
                                item.cantidad_verificada < item.cantidad
                                  ? "red"
                                  : "black",
                              bold: item.cantidad_verificada < item.cantidad,
                            },
                            { text: item.lote || "", fontSize: 8 },
                            { text: item.vencimiento || "", fontSize: 8 },
                          ]),
                        ],
                      },
                      layout: {
                        hLineWidth: function () {
                          return 0.5;
                        },
                        vLineWidth: function () {
                          return 0.5;
                        },
                        hLineColor: function () {
                          return "#aaa";
                        },
                        vLineColor: function () {
                          return "#aaa";
                        },
                        paddingLeft: function () {
                          return 5;
                        },
                        paddingRight: function () {
                          return 5;
                        },
                        paddingTop: function () {
                          return 3;
                        },
                        paddingBottom: function () {
                          return 3;
                        },
                      },
                      margin: [0, 5],
                    },
                    // Resumen del ingreso
                    {
                      columns: [
                        {
                          text: `Total de artículos(s): ${ingreso.items.length}`,
                          fontSize: 8,
                          bold: true,
                          width: "*",
                        },
                        {
                          text: `Total verificado(s): ${ingreso.items.reduce(
                            (acc, item) => acc + item.cantidad_verificada,
                            0
                          )}`,
                          fontSize: 8,
                          bold: true,
                          width: "*",
                        },
                      ],
                      margin: [0, 5],
                    },
                    // Línea separadora entre ingresos
                    {
                      canvas: [
                        {
                          type: "line",
                          x1: 0,
                          y1: 0,
                          x2: 595,
                          y2: 0,
                          lineWidth: 0.2,
                          lineColor: "#6e6e6e",
                        },
                      ],
                      margin: [0, 10, 0, 10],
                    },
                  ])
                  .flat(),
                // Resumen final
                {
                  columns: [
                    {
                      text: `Total de ingreso(s): ${data.length}`,
                      fontSize: 9,
                      bold: true,
                      margin: [0, 10],
                    },
                  ],
                },
              ],
              styles: {
                tableHeader: {
                  fontSize: 8,
                  bold: true,
                  color: "white",
                  fillColor: "#1e40af",
                  alignment: "center",
                },
                subTableHeader: {
                  fontSize: 8,
                  bold: true,
                  color: "white",
                  fillColor: "#6388ff",
                  alignment: "center",
                },
              },
              defaultStyle: {
                fontSize: 8,
              },
            };

            await generatePDF(docDefinition as any, action, nombreArchivo);
            toast({
                title: "PDF generado",
                description: "El PDF se ha generado correctamente",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onComplete?.();
        } catch (error) {
            console.error("Error al generar PDF:", error);
            toast({
                title: "Error",
                description: "Ocurrió un error al generar el PDF",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            onError?.(error);
        }
    };

    useEffect(() => {
        console.log("Generando reporte")
        console.log("con los siguientes filtros", filtros)
        generarReporteIngresos(filtros)
    }, []);

    useEffect(() => {
        if (reporteIngresos.length > 0) {
            console.log("Reporte ingresos", reporteIngresos)
            generarPDF(reporteIngresos);
            console.log("Reporte generado")
        }
    }, [reporteIngresos]);


    return (
        <div>
            <h1>Reporte de Ingresos</h1>
        </div>
    )
}

export default ReporteIngresosComponent;
