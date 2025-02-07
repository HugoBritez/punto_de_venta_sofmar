import axios from "axios";
import { api_url } from "@/utils";
import { useState, useEffect } from "react";
import { Configuraciones } from "@/types/shared_interfaces";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface PreparacionPedido {
  id_pedido: number;
  fecha: string;
  deposito: string;
  sucursal: string;
  cliente: string;
  articulos: [
    {
      cod_interno: number;
      cod_barras: string;
      descripcion: string;
      vencimiento: string;
      lote: string;
      cantidad: number;
      ubicacion: string;
      sububicacion: string;
      stock: number;
    }
  ];
}

const DocumentoPreparacion = ({
  pedido_id,
  consolidar,
  cliente,
  fecha_desde,
  fecha_hasta,
  estado,
  onRef,
  onPedidosImpresos,
}: {
  pedido_id: number | null;
  consolidar: number;
  cliente: number | null;
  fecha_desde: string | null;
  fecha_hasta: string | null;
  estado: number | null;
  onRef?: (ref: { generarPDF: () => Promise<void> }) => void;
  onPedidosImpresos?: (ids: number[]) => void;
}) => {
  const [pedido, setPedido] = useState<PreparacionPedido[] | null>(null);
  const [configuraciones, setConfiguraciones] = useState<Configuraciones[]>([]);
  const nombreEmpresa = configuraciones[0]?.valor || "N/A";

  const rucEmpresa = configuraciones[30]?.valor || "N/A";

  const fechaCompletaActual = new Date().toLocaleDateString();
  const operador = sessionStorage.getItem("user_name") || "N/A";
  const fetchConfiguraciones = async () => {
    try {
      const response = await axios.get(`${api_url}configuraciones/todos`);
      setConfiguraciones(response.data.body);
    } catch (error) {
      console.error(error);
    }
  };
  const getPedido = async (
    pedido_param: number,
    consolidar_param: number,
    cliente_param: number | null,
    fecha_desde_param: string | null,
    fecha_hasta_param: string | null,
    estado_param: number | null
  ) => {
    try {
      const response = await axios.get(`${api_url}pedidos/preparacion-pedido`, {
        params: {
          id: pedido_param,
          consolidar: consolidar_param,
          cliente: cliente_param,
          fecha_desde: fecha_desde_param,
          fecha_hasta: fecha_hasta_param,
          estado: estado_param,
        },
      });
      console.log(response.data.body);

      setPedido(response.data.body);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (pedido_id) {
      fetchConfiguraciones();
      getPedido(
        pedido_id,
        consolidar,
        cliente,
        fecha_desde,
        fecha_hasta,
        estado
      );
    }
  }, [pedido_id, consolidar, cliente, fecha_desde, fecha_hasta, estado]);

  
  function concatenarDatos(pedido: PreparacionPedido[]) {
    if (!pedido) return "";
    return pedido.map((p) => p.id_pedido).join(", ");
  }
  useEffect(() => {
    if (onRef) {
      onRef({ generarPDF });
    }
  }, [onRef]);


const generarPDF = async () => {
  try {
    // Validación inicial de datos
    if (!pedido || pedido.length === 0) {
      console.log("No hay datos de pedidos disponibles");
      return;
    }

    const elemento = document.getElementById("reporte");
    if (!elemento) {
      console.log("Elemento 'reporte' no encontrado");
      return;
    }

    console.log(
      "Iniciando generación de PDF para pedidos:",
      pedido.map((p) => p.id_pedido)
    );

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

    let yOffset = 0;
    const marginTop = 8;
    const marginBottom = 24;

    while (yOffset < canvasHeight) {
      // Crear un canvas temporal para la sección de la página actual
      const pageCanvas = document.createElement("canvas");
      const pageHeight = Math.min(
        canvasHeight - yOffset,
        (canvasWidth * (pdfHeight - marginTop - marginBottom)) / pdfWidth
      );

      pageCanvas.width = canvasWidth;
      pageCanvas.height = pageHeight;

      const context = pageCanvas.getContext("2d");
      if (!context) {
        throw new Error("No se pudo obtener el contexto 2D del canvas.");
      }

      context.drawImage(
        canvas,
        0,
        yOffset,
        canvasWidth,
        pageHeight,
        0,
        0,
        canvasWidth,
        pageHeight
      );

      const pageImgData = pageCanvas.toDataURL("image/png");
      const pageHeightScaled = (pageHeight * pdfWidth) / canvasWidth;

      if (yOffset > 0) {
        pdf.addPage();
      }

      pdf.addImage(
        pageImgData,
        "PNG",
        0,
        marginTop,
        pdfWidth,
        pageHeightScaled - marginBottom
      );

      yOffset += pageHeight;
    }

    // Guardar PDF
    pdf.save(`separacion_pedidos_${fechaCompletaActual}.pdf`);

    // Obtener IDs de pedidos y llamar a la función de actualización
    const pedidoIds = pedido.map((p) => p.id_pedido);
    console.log("PDF generado exitosamente, actualizando pedidos:", pedidoIds);

    if (onPedidosImpresos) {
      await onPedidosImpresos(pedidoIds);
    } else {
      console.log("No se proporcionó función onPedidosImpresos");
    }
  } catch (error) {
    console.error("Error al generar PDF:", error);
    throw error; 
  }
};

  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-col gap-2 w-[80%] px-10" id="reporte">
        <div className="border border-gray-400  rounded-sm">
          <div className=" border-b border-gray-400 flex justify-between  text-sm text-gray-600 font-bold">
            <p>RUC: {rucEmpresa}</p>
            <p>{nombreEmpresa}</p>
            <p>{fechaCompletaActual}</p>
          </div>
          <div className="border-b border-gray-400">
            <p className="text-center text-lg font-bold">
              SEPARACION DE ARTICULOS PARA PEDIDO
            </p>
            <div className="flex justify-between px-2 my-4">
              <p>
                <strong>Cliente:</strong> {pedido?.[0]?.cliente}
              </p>
              <p>
                <strong>Pedido Nro.:</strong> {concatenarDatos(pedido || [])}
              </p>
              <p>
                <strong>Fecha:</strong> {pedido?.[0]?.fecha}
              </p>
              <p>
                <strong>Deposito:</strong> {pedido?.[0]?.deposito}
              </p>
              <p>
                <strong>Sucursal:</strong> {pedido?.[0]?.sucursal}
              </p>
            </div>
          </div>
          <p className="text-end text-sm text-gray-600 font-bold">
            Operador: {operador}
          </p>
        </div>
        <div className="w-full">
          <table className="w-full">
            <thead className="border border-gray-400 bg-gray-100">
              <tr className="text-sm text-gray-600 font-bold border  [&>th]:border [&>th]:border-gray-400">
                <th>Codigo Interno</th>
                <th>Codigo Barras</th>
                <th>Descripcion</th>
                <th>Vencimiento</th>
                <th>Lote</th>
                <th>Cantidad</th>
                <th>Ubi./Sub Ubi.</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {pedido?.flatMap((p) =>
                p.articulos.map((articulo) => (
                  <tr
                    key={`${p.id_pedido}-${articulo.cod_interno}`}
                    className=" [&>td]:border [&>td]:border-gray-400 [&>td]:px-2"
                  >
                    <td className="text-center">{articulo.cod_interno}</td>
                    <td className="text-center">{articulo.cod_barras}</td>
                    <td>{articulo.descripcion}</td>
                    <td className="text-center">{articulo.vencimiento}</td>
                    <td className="text-center">{articulo.lote}</td>
                    <td className="text-center">{articulo.cantidad}</td>
                    <td>
                      {articulo.ubicacion}/{articulo.sububicacion}
                    </td>
                    <td className="text-center">{articulo.stock}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentoPreparacion;
