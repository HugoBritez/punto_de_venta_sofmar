import { Configuraciones } from "@/types/shared_interfaces";
import { api_url } from "@/utils";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import { generatePDF } from "@/services/pdfService";

interface ReporteAnomaliasProps {
  numeroInventario: number;
  sucursal: number;
  deposito: number;
}

interface ReporteAnomalias {
  fecha: string;
  hora: string;
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
          `${api_url}articulos/reporte-anomalias`,
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
          { text: `Fecha: ${anomaliaData.fecha}`, fontSize: 8 },
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
              widths: ["auto", "*", "auto", "auto", "auto"],
              body: [
                [
                  { text: item.cod_interno, bold: true, fontSize: 8 },
                  { text: item.articulo, bold: true, fontSize: 8 },
                  { text: "Stock Total:" + item.cantidad_inicial_total, bold: true, alignment: "right", fontSize: 8 },
                  { text: "Scanner Total:" + item.cantidad_scanner_total, bold: true, alignment: "right", fontSize: 8 },
                  { text: "Diferencia:" + item.diferencia_total, bold: true, alignment: "right", color: (item.diferencia_total || 0) < 0 ? "red" : "black", fontSize: 8 },
                ],
              ],
            },
            layout: "noBorders",
            fillColor: "#f0f0f0",
            margin: [0, 5, 0, 5],
          },
          // Tabla de lotes
          {
            table: {
              widths: ["auto", "auto", "auto", "auto", "auto"],
              body: [
                // Encabezados
                [
                  { text: "Lote", style: "tableHeader" },
                  { text: "Vencimiento", style: "tableHeader" },
                  { text: "Stock", style: "tableHeader", alignment: "center" },
                  {
                    text: "Scanner",
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
                  { text: lote.vencimiento || "", alignment: "left", fontSize: 8 },
                  { text: lote.cantidad_inicial || 0, alignment: "center", fontSize: 8 },
                  { text: lote.cantidad_scanner || 0, alignment: "center", fontSize: 8 },
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

  try {
    await generatePDF(docDefinition as any, "download");
  } catch (error) {
    console.error("Error generando PDF:", error);
  }
};

  return (
    <div className="flex flex-col gap-2 w-full h-full items-center justify-center">
      {loading ? (
        <div>Cargando...</div>
      ) : reporte && reporte.length ? (
        <div className="flex flex-col gap-2 w-full h-full items-center justify-center">
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
                  <strong>Fecha desde</strong>: {reporte[0].fecha},{" "}
                  {reporte[0].hora}
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
            h={"100vh"}
          >
            {/* <div
              className="flex flex-col gap-2 w-[85%] h-full px-8 items-center"
              id="reporte"
            >
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="text-left">Ubi/Sub-Ubi</th>
                    <th className="text-left">Codigo Interno</th>
                    <th className="text-left">Articulo</th>
                    <th className="text-left">Lote</th>
                    <th className="text-left">Vencimiento</th>
                    <th className="text-center">Cantidad Scanner</th>
                    <th className="text-center">Cantidad Inicial</th>
                    <th className="text-center">Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {reporte[0].items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        {item.ubicacion} / {item.sub_ubicacion}
                      </td>
                      <td>{item.cod_interno}</td>
                      <td>{item.articulo}</td>
                      <td>{item.items_lote[0].lote}</td>
                      <td>{item.vencimiento}</td>
                      <td className="text-center">
                        {item.items_lote[0].cantidad_scanner || 0}
                      </td>
                        <td className="text-center">
                        {item.items_lote[0].cantidad_inicial || 0}
                      </td>
                      <td className="text-center">
                        {item.items_lote[0].diferencia || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-col border border-gray-200 w-full p-2">
                <p className="font-bold ">
                  Total de articulos: {reporte[0].items.length}
                </p>
              </div>
            </div> */}
          </Flex>
          <div className="flex flex-row gap-2 w-full items-end justify-end mt-8">
            <button
              className="bg-blue-500 text-white p-2 rounded-md"
              onClick={() => generarPDF(reporte)}
            >
              Generar PDF
            </button>
          </div>
        </div>
      ) : (
        <div>No hay datos disponibles</div>
      )}
    </div>
  );
};

export default ReporteAnomalias;
