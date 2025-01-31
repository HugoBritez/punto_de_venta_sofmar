import { Configuraciones } from "@/types/shared_interfaces";
import { api_url } from "@/utils";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import React, { useState, useEffect } from "react";
import { Flex } from "@chakra-ui/react";

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


  const generarPDF = async () => {
    const elemento = document.getElementById("reporte");
    if (!elemento) return;

    const scale = 4;

    // Generar el canvas a partir del elemento
    const canvas = await html2canvas(elemento, {
      scale: scale,
      scrollX: 0,
      scrollY: 0,
      windowWidth: elemento.scrollWidth,
      windowHeight: elemento.scrollHeight,
    });

    const pdf = new jsPDF("p", "mm", "a4");

    // Dimensiones del PDF
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Dimensiones del canvas
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    let yOffset = 0; // Posición vertical para empezar a recortar
    const marginTop = 8; // Margen superior para las páginas adicionales
    const marginBottom = 24; // Margen inferior
    let pageNumber = 1; // Número de página inicial

    while (yOffset < canvasHeight) {
      // Crear un canvas temporal para la sección de la página actual
      const pageCanvas = document.createElement("canvas");
      // Ajustar el tamaño de la página con margen inferior
      const pageHeight = Math.min(
        canvasHeight - yOffset,
        (canvasWidth * (pdfHeight - marginTop - marginBottom)) / pdfWidth
      );

      pageCanvas.width = canvasWidth;
      pageCanvas.height = pageHeight;

      const context = pageCanvas.getContext("2d");
      if (!context) {
        console.error("No se pudo obtener el contexto 2D del canvas.");
        return;
      }

      context.drawImage(
        canvas,
        0,
        yOffset,
        canvasWidth,
        pageHeight, // Parte del canvas original
        0,
        0,
        canvasWidth,
        pageHeight // Dibujo en el nuevo canvas
      );

      const pageImgData = pageCanvas.toDataURL("image/png");
      const pageHeightScaled = (pageHeight * pdfWidth) / canvasWidth;

      if (yOffset > 0) {
        pdf.addPage();
      }

      // Dibujar líneas y cuadros
      pdf.setDrawColor(145, 158, 181);
      pdf.setLineWidth(0.3);
      pdf.rect(5, marginTop - 5, pdfWidth - 10, 38); // Cuadro principal
      pdf.line(5, marginTop + 2, pdfWidth - 5, marginTop + 2); // Línea debajo de la cabecera
      pdf.line(5, marginTop + 30, pdfWidth - 5, marginTop + 30); // Línea debajo de la información adicional

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6);
      pdf.text(`Empresa: ${nombreEmpresa}`, 15, marginTop);
      pdf.text(`RUC: ${rucEmpresa}`, pdfWidth / 2, marginTop);
      pdf.text(
        `${fechaCompletaActual} - ${sessionStorage.getItem("user_name")}`,
        pdfWidth - 40,
        marginTop
      );

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("Informe de anomalias de inventario", pdfWidth / 2, marginTop + 8, {
        align: "center",
      });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6);
      pdf.text(`Fecha: ${reporte[0].fecha}, ${reporte[0].hora}`, 10, marginTop + 12);
      pdf.text(
        `Sucursal: ${
          reporte[0].nombre_sucursal
        }`,
        10,
        marginTop + 16
      );

      pdf.text(
        `Deposito: ${
          reporte[0].nombre_deposito
        }`,
        10,
        marginTop + 20
      );


      pdf.text(
        `Estado: ${
          reporte[0].estado_inventario
        }`,
        10,
        marginTop + 24

      );
      pdf.text(
        `Inventario Nro: ${numeroInventario}`,
        10,
        marginTop + 28
      );

      pdf.text(`Página: ${pageNumber}`, 10, marginTop + 32);
      pageNumber++;
      // Agregar la imagen de la página
      pdf.addImage(
        pageImgData,
        "PNG",
        0,
        marginTop + 34,
        pdfWidth,
        pageHeightScaled - marginBottom
      );

      yOffset += pageHeight;
    }

    pdf.save(`reporte_anomalias_${fechaCompletaActual}.pdf`);
  };

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
            onClick={generarPDF}
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
