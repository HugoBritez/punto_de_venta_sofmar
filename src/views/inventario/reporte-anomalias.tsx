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
  items: [
    {
      articulo: string;
      cod_interno: string;
      lote_id: number;
      lote: string;
      vencimiento: string;
      ubicacion: string;
      sub_ubicacion: string;
      cantidad_inicial: number;
      cantidad_scanner: number;
      diferencia: number;
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

  useEffect(() => {
    console.log(reporte);
  }, [reporte]);


const generarPDF = async (data: ReporteAnomalias[]) => {
  try{
    const docDefinicion = {
      pageSize: "A4",
      pageMargins: [20, 110, 20, 10],
      header: {
        margin: [10, 10, 10, 0],
        stack: [
          {
            columns: [
              {
                text: `${rucEmpresa}`,
                width: "auto",
                fontSize: 8,
              },
              {
                text: `${nombreEmpresa}`,
                width: "*",
                fontSize: 8,
                alignment: "center",
              },
              {
                text: `${fechaCompletaActual}`,
                width: "auto",
                fontSize: 8,
                alignment: "right",
              },
            ],
          },
          {
            text: "REPORTE DE ANOMALIAS DE INVENTARIO",
            alignment: "center",
            fontSize: 12,
            bold: true,
            margin: [0, 10],
          },
          {
            columns: [
              {
                text: `Sucursal: ${data[0].nombre_sucursal}`,
                width: "*",
                fontSize: 10,
              },
              {
                text: `Deposito: ${data[0].nombre_deposito}`,
                width: "*",
                fontSize: 10,
              },
              {
                text: `Inventario Nro: ${numeroInventario}`,
                width: "*",
                fontSize: 10,
              },
              {
                text: `Estado: ${data[0].estado_inventario}`,
                width: "*",
                fontSize: 10,
              },
            ],
            margin: [0, 10],
          },
          {
            text: `Operador: ${data[0].operador_nombre}`,
            alignment: "right",
            fontSize: 8,
            margin: [0, 5],
          },
          {
            canvas: [
              {
                type: "line",
                x1: 0,
                y1: 5,
                x2: 575,
                y2: 5,
                lineWidth: 1,
                lineColor: "#CCCCCC",
              },
            ],
          },
        ],
      },
      content: [
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
              "auto",
            ],
            body: [
              [
                { text: "Ubi/Sub-Ubi", fillColor: "#ecedee", fontSize: 8 },
                { text: "Codigo Interno", fillColor: "#ecedee", fontSize: 8 },
                { text: "Articulo", fillColor: "#ecedee", fontSize: 8 },
                { text: "Lote", fillColor: "#ecedee", fontSize: 8 },
                { text: "Vencimiento", fillColor: "#ecedee", fontSize: 8 },
                { text: "Cantidad Scanner", fillColor: "#ecedee", fontSize: 8 },
                { text: "Cantidad Inicial", fillColor: "#ecedee", fontSize: 8 },
                { text: "Diferencia", fillColor: "#ecedee", fontSize: 8 },
              ],
              ...data[0].items.map((item) => [
                {
                  text: `${item.ubicacion}/${item.sub_ubicacion}`,
                  fontSize: 8,
                },
                { text: item.cod_interno, fontSize: 8 },
                { text: item.articulo, fontSize: 8 },
                { text: item.lote, fontSize: 8 },
                { text: item.vencimiento, fontSize: 8 },
                { text: item.cantidad_scanner || 0, fontSize: 8 },
                { text: item.cantidad_inicial || 0, fontSize: 8 },
                { text: item.diferencia || 0, fontSize: 8 },
              ]),
            ],
          },
        },
        {
          text: `Total de articulos: ${data[0].items.length}`,
          alignment: "right",
          fontSize: 8,
          margin: [0, 5],
        },
      ],
      styles: {
        tableHeader: {
          bold: true,
          fontSize: 8,
          color: "black",
        },
        tableBody: {
          fontSize: 8,
        },
      },
      defaultStyle: {
        fontSize: 8,
      },
    };

    await generatePDF( docDefinicion as any, "download")
  } catch (error) {
    console.error("Error al generar el PDF:", error);
  }
}

return (
  <div className="flex flex-col gap-2 w-full h-full items-center justify-center">
    {loading ? (
      <div>Cargando...</div>
    ) : reporte && reporte.length > 0 ? (
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
          <div
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
                    <td>{item.lote}</td>
                    <td>{item.vencimiento}</td>
                    <td className="text-center">{item.cantidad_scanner || 0}</td>
                    <td className="text-center">{item.cantidad_inicial}</td>
                    <td className="text-center">{item.diferencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-col border border-gray-200 w-full p-2">
              <p className="font-bold ">
                Total de articulos: {reporte[0].items.length}
              </p>
            </div>
          </div>
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
