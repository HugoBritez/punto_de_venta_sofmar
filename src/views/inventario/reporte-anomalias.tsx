import { Configuraciones } from "@/types/shared_interfaces";
import { api_url } from "@/utils";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { Flex, useToast, Spinner } from "@chakra-ui/react";
import { generatePDF } from "@/services/pdfService";
import { generarReporteAnomaliasExcel } from "./excel/ReporteAnomaliasExcel";

interface ReporteAnomaliasProps {
  numeroInventario: number;
  sucursal: number;
  deposito: number;
}

interface ReporteAnomalias {
  id_inventario: number;
  fecha: string;
  fecha_cierre: string;
  hora: string;
  hora_cierre: string;
  operador: number;
  operador_nombre: string;
  nombre_sucursal: string;
  nombre_deposito: string;
  estado_inventario: string;
  nro_inventario: number;
  items: [
    {
      articulo_id: number;
      articulo: string;
      cod_interno: string;
      items_lotes: [
        {
          cod_barras: string;
          vencimiento: string;
          lote_id: number;
          lote: string;
          cantidad_inicial: number;
          cantidad_scanner: number;
          items_vendidos: number;
          items_devueltos: number;
          items_comprados: number;
          cantidad_actual: number;
          diferencia: number;
          costo_diferencia: number;
        }
      ];
      ubicacion: string;
      sub_ubicacion: string;
      cantidad_inicial_total: number;
      cantidad_scanner_total: number;
      diferencia_total: number;
      costo_diferencia_total: number;
    }
  ];
}

const ReporteAnomalias: React.FC<ReporteAnomaliasProps> = ({
  numeroInventario,
  sucursal,
  deposito,
}) => {
  const [reporte, setReporte] = useState<ReporteAnomalias[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [configuracionesEmpresa, setConfiguracionesEmpresa] = useState<
    Configuraciones[]
  >([]);

  const nombreEmpresa = configuracionesEmpresa[0]?.valor || "N/A";
  const rucEmpresa = configuracionesEmpresa[30]?.valor || "N/A";
  const fechaCompletaActual = new Date().toLocaleString();

  const fetchConfiguraciones = async () => {
    try {
      const response = await axios.get(`${api_url}configuraciones/todos`);
      setConfiguracionesEmpresa(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchReporte = async () => {
      try {
        const response = await axios.get(
          `${api_url}inventarios/anomalias`,
          {
            params: {
              nro_inventario: numeroInventario,
              sucursal: sucursal,
              deposito: deposito,
            },
          }
        );
        console.log(response.data.body);
        setReporte(response.data.body);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener el reporte de anomalias:", error);
        setLoading(false);
      }
    };

    if (numeroInventario && sucursal && deposito) {
      fetchReporte();
      fetchConfiguraciones();
    }
  }, [numeroInventario, sucursal, deposito]);

  const generarPDF = async (data: ReporteAnomalias[]) => {
    if (!data || data.length === 0 || !data[0]?.items) {
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
      const anomaliaData = data[0];
      console.log("generarPDF", anomaliaData);

      const docDefinition = {
        pageSize: "A4",
        pageMargins: [20, 20, 20, 20],
        content: [
          // Encabezado
          {
            columns: [
              { text: `RUC: ${rucEmpresa}`, width: "auto", fontSize: 8 },
              { text: nombreEmpresa, alignment: "center", width: "*", fontSize: 8 },
              {
                text: fechaCompletaActual,
                alignment: "right",
                width: "auto",
                fontSize: 8,
              },
            ],
          },
          {
            text: "REPORTE DE ANOMALIAS DE INVENTARIO",
            alignment: "center",
            fontSize: 10,
            bold: true,
            margin: [0, 10],
          },
          {
            columns: [
              {
                text: `Inventario Nro.: ${anomaliaData.nro_inventario}`,
                fontSize: 8,
              },
              {
                text: `Fecha apertura: ${anomaliaData.fecha}, ${anomaliaData.hora}`,
                fontSize: 8,
              },
              {
                text: `Fecha cierre: ${
                  anomaliaData.fecha_cierre === null ||
                  anomaliaData.fecha_cierre === undefined
                    ? "N/A"
                    : anomaliaData.fecha_cierre
                }, ${
                  anomaliaData.hora_cierre === null ||
                  anomaliaData.hora_cierre === undefined
                    ? "N/A"
                    : anomaliaData.hora_cierre
                }`,
                fontSize: 8,
              },
              { text: `Deposito: ${anomaliaData.nombre_deposito}`, fontSize: 8 },
              { text: `Sucursal: ${anomaliaData.nombre_sucursal}`, fontSize: 8 },
              { text: `Estado: ${anomaliaData.estado_inventario}`, fontSize: 8 },
            ],
            columnGap: 10,
            margin: [0, 5, 0, 10],
          },
          // Contenido principal - Items agrupados
          ...anomaliaData.items
            .map((item) => [
              // Encabezado del artículo
              {
                table: {
                  widths: ["auto", "auto", "*", "auto", "auto", "auto"],
                  body: [
                    [
                      { text: item.cod_interno, bold: true, fontSize: 8 },
                      {
                        text: item.ubicacion + " / " + item.sub_ubicacion,
                        bold: true,
                        fontSize: 8,
                      },
                      { text: item.articulo, bold: true, fontSize: 8 },
                      {
                        text: "Stock Total:" + item.cantidad_inicial_total,
                        bold: true,
                        alignment: "right",
                        fontSize: 8,
                      },
                      {
                        text: "Scanner Total:" + item.cantidad_scanner_total,
                        bold: true,
                        alignment: "right",
                        fontSize: 8,
                      },
                      {
                        text: "Diferencia:" + item.diferencia_total,
                        bold: true,
                        alignment: "right",
                        color: (item.diferencia_total || 0) < 0 ? "red" : "black",
                        fontSize: 8,
                      },
                    ],
                  ],
                },
                fillColor: "#f0f0f0",
                margin: [0, 5, 0, 5],
                layout: {
                  hLineWidth: function () {
                    return 0.5;
                  },
                  vLineWidth: function () {
                    return 0.5;
                  },
                },
              },
              // Tabla de lotes
              {
                table: {
                  widths: ["auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
                  body: [
                    // Encabezados
                    [
                      { text: "Lote", style: "tableHeader" },
                      { text: "Vencimiento", style: "tableHeader" },
                      {
                        text: "Cdad. Inicial",
                        style: "tableHeader",
                        alignment: "center",
                      },
                      {
                        text: "Cdad. Encontrada",
                        style: "tableHeader",
                        alignment: "center",
                      },
                      {
                        text: "Cdad. Real",
                        style: "tableHeader",
                        alignment: "center",
                      },
                      {
                        text: "I. Vendidos",
                        style: "tableHeader",
                        alignment: "center",
                      },
                      {
                        text: "I. Remision",
                        style: "tableHeader",
                        alignment: "center",
                      },
                      {
                        text: "Diferencia",
                        style: "tableHeader",
                        alignment: "center",
                      },
                    ],
                    ...item.items_lotes.map((lote) => [
                      { text: lote.lote || "", alignment: "left", fontSize: 8 },
                      {
                        text: lote.vencimiento || "",
                        alignment: "left",
                        fontSize: 8,
                      },
                      {
                        text: lote.cantidad_inicial || 0,
                        alignment: "center",
                        fontSize: 8,
                      },
                      {
                        text: lote.cantidad_scanner || 0,
                        alignment: "center",
                        fontSize: 8,
                      },
                      {
                        text: lote.cantidad_actual || 0,
                        alignment: "center",
                        fontSize: 8,
                      },
                      {
                        text: lote.items_vendidos || 0,
                        alignment: "center",
                        fontSize: 8,
                      },
                      {
                        text: lote.items_devueltos || 0,
                        alignment: "center",
                        fontSize: 8,
                      },
                      {
                        text: lote.diferencia || 0,
                        alignment: "center",
                        color: (lote.diferencia || 0) < 0 ? "red" : "black",
                        fontSize: 8,
                      },
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
                margin: [40, 0, 40, 5],
              },
            ])
            .flat(),
        ],
        styles: {
          tableHeader: {
            bold: true,
            fontSize: 8,
            fillColor: "#f8f9fa",
            alignment: "center",
          },
        },
        defaultStyle: {
          fontSize: 8,
        },
      };

      await generatePDF(docDefinition as any, "download");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al generar el PDF",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  return (
    <div className="flex flex-col gap-4 w-full">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
          <p className="ml-4">Cargando datos del reporte...</p>
        </div>
      ) : reporte && reporte.length > 0 && reporte[0]?.items ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 w-full border border-gray-300 rounded-sm p-2">
            <div className="flex flex-row gap-2 w-full items-center justify-between border-b">
              <p>{rucEmpresa}</p>
              <p>{nombreEmpresa}</p>
              <div>
                <p>{fechaCompletaActual}</p>
                <p>{sessionStorage.getItem("user_name")}</p>
              </div>
            </div>
            <div className="flex flex-col border-b">
              <h1 className="text-center text-lg font-bold">
                Reporte de anomalias de inventario
              </h1>
              <div className="flex flex-col gap-2 w-full  justify-between mb-4">
                <p>
                  <strong>Fecha apertura</strong>: {reporte[0].fecha},{" "}
                  {reporte[0].hora}
                </p>
                <p>
                  <strong>Fecha cierre</strong>:{" "}
                  {reporte[0].fecha_cierre === null ||
                  reporte[0].fecha_cierre === undefined
                    ? "N/A"
                    : reporte[0].fecha_cierre}
                  ,{" "}
                  {reporte[0].hora_cierre === null ||
                  reporte[0].hora_cierre === undefined
                    ? "N/A"
                    : reporte[0].hora_cierre}
                </p>
                <p>
                  <strong>Sucursal</strong>: {reporte[0].nombre_sucursal}
                </p>
                <p>
                  <strong>Deposito</strong>: {reporte[0].nombre_deposito}
                </p>
                <p>
                  <strong>Inventario Nro</strong>: {numeroInventario}
                </p>
                <p>
                  <strong>Estado</strong>: {reporte[0].estado_inventario}
                </p>
              </div>
            </div>
          </div>
          <Flex
            flexDir={"column"}
            bg={"white"}
            rounded={"md"}
            px={16}
            mt={4}
            w={"100%"}
            h={"60vh"}
            overflowY={"auto"}
          >
            <div
              className="flex flex-col gap-2 w-full h-full px-8 items-center"
              id="reporte"
            >
              {reporte[0]?.items?.map((item) => (
                <div key={item.articulo_id} className="w-full">
                  <div className="flex flex-row  w-full border border-gray-200 bg-gray-100 [&>div]:px-2">
                    <div className="border border-b-black border-t-black border-l-black flex w-auto ">
                      <p>{item.cod_interno}</p>
                    </div>
                    <div className="border border-b-black border-t-black border-l-black flex w-auto ">
                      <p>{item.ubicacion + " / " + item.sub_ubicacion}</p>
                    </div>
                    <div className="border border-b-black border-t-black flex flex-1 border-l-black ">
                      <p>{item.articulo}</p>
                    </div>
                    <div className="border border-b-black border-t-black flex border-l-black  w-auto">
                      <p>Stock Inicial Total: {item.cantidad_inicial_total}</p>
                    </div>
                    <div className="border border-b-black border-t-black flex border-l-black  w-auto">
                      <p>Stock Scanner Total: {item.cantidad_scanner_total}</p>
                    </div>
                    <div className="border border-b-black border-t-black border-l-black  border-r-black flex w-auto">
                      <p>Diferencia Total: {item.diferencia_total}</p>
                    </div>
                  </div>
                  <div>
                    <table className="border-2 border-gray-400 mt-2">
                      <thead className="border-2 border-gray-400 ">
                        <tr className="[&>th]:border-2 [&>th]:border-gray-400 [&>th]:px-2">
                          <th>Lote</th>
                          <th>Vencimiento</th>
                          <th>Cdad. Inicial</th>
                          <th>Cdad. Encontrada</th>
                          <th>I. Vendidos</th>
                          <th>I. Remision</th>
                          <th>Cdad. Real</th>
                          <th>Diferencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.items_lotes.map((lote) => (
                          <tr className="[&>td]:border-2 [&>td]:border-gray-400 [&>td]:px-2">
                            <td className="text-center">{lote.lote}</td>
                            <td className="text-center">{lote.vencimiento}</td>
                            <td className="text-center">
                              {lote.cantidad_inicial || 0}
                            </td>
                            <td className="text-center">
                              {lote.cantidad_scanner || 0}
                            </td>
                            <td className="text-center">
                              {lote.items_vendidos || 0}
                            </td>
                            <td className="text-center">
                              {lote.items_devueltos || 0}
                            </td>
                            <td className="text-center">
                              {lote.cantidad_actual || 0}
                            </td>
                            <td className="text-center">
                              {lote.diferencia || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              <div className="flex flex-col border border-gray-200 w-full p-2">
                <p className="font-bold">
                  Total de artículos:{" "}
                  {reporte[0]?.items?.reduce(
                    (acc, item) => acc + (item.items_lotes?.length || 0),
                    0
                  ) || 0}
                </p>
              </div>
            </div>
          </Flex>
          <div className="flex flex-row gap-2 w-full items-end justify-end mt-8">
            <button
              className="bg-blue-500 text-white p-2 rounded-md"
              onClick={() => generarReporteAnomaliasExcel(reporte[0])}
              disabled={loading || !reporte || reporte.length === 0}
            >
              Generar EXCEL
            </button>
            <button
              className="bg-blue-500 text-white p-2 rounded-md"
              onClick={() => generarPDF(reporte)}
              disabled={loading || !reporte || reporte.length === 0}
            >
              Generar PDF
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p>No hay datos disponibles para mostrar</p>
        </div>
      )}
    </div>
  );
};

export default ReporteAnomalias;
