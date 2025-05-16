import axios from "axios";
import { api_url } from "@/utils";
import { useState, useEffect } from "react";
import { Configuraciones } from "@/shared/types/shared_interfaces";
import { generatePDF } from "@/shared/services/pdfService";

interface PreparacionPedido {
  id_pedido: number;
  fecha: string;
  deposito: string;
  sucursal: string;
  cliente: string;
  obs: string;
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
  obs,
  action = "print",
  onComplete,
  onError
}: {
  pedido_id: number | null;
  consolidar: number;
  cliente: number | null;
  fecha_desde: string | null;
  fecha_hasta: string | null;
  estado: number | null;
  obs: string;
  action?: "print" | "generate";
  onComplete?: () => void;
  onError?: (error: any) => void;
}) => {
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

      const data = response.data.body;

      console.log("data", data);

      await generarPDF(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchConfiguraciones();
  }, []);

  useEffect(() => {
    console.log("Pedido ID:", pedido_id);
    if (pedido_id) {
      getPedido(
        pedido_id,
        consolidar,
        cliente,
        fecha_desde,
        fecha_hasta,
        estado
      );
    }
  }, [pedido_id, consolidar, cliente, fecha_desde, fecha_hasta, estado, configuraciones]);


const generarPDF = async (data: PreparacionPedido[]) => {
  try {
    console.log("Empezando a generar el PDF");
    console.log("data del pdf", data);

    const pedidoData = data[0];

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [20, 20, 20, 20],
      content: [
        {
          columns: [
            { text: `RUC: ${rucEmpresa}`, width: "auto", fontSize: 8 },
            {
              text: nombreEmpresa,
              alignment: "center",
              width: "*",
              fontSize: 8,
            },
            {
              text: fechaCompletaActual,
              alignment: "right",
              width: "auto",
              fontSize: 8,
            },
          ],
        },
        {
          text: "SEPARACION DE ARTICULOS PARA PEDIDO",
          alignment: "center",
          fontSize: 12,
          bold: true,
          margin: [0, 10],
        },
        {
          columns: [
            {
              text: `Cliente: ${pedidoData.cliente}`,
              width: "*",
              fontSize: 10,
            },
            {
              text: `Pedido Nro.: ${pedidoData.id_pedido}`,
              width: "*",
              fontSize: 10,
            },
            { text: `Fecha: ${pedidoData.fecha}`, width: "*", fontSize: 10 },
            {
              text: `Deposito: ${pedidoData.deposito}`,
              width: "*",
              fontSize: 10,
            },
            {
              text: `Sucursal: ${pedidoData.sucursal}`,
              width: "*",
              fontSize: 10,
            },
          ],
          margin: [0, 10],
        },
        {
          text: `Observacion: ${obs}`,
          alignment: "right",
          fontSize: 8,
          margin: [0, 5],
        },
        {
          text: `Operador: ${operador}`,
          alignment: "right",
          fontSize: 8,
          margin: [0, 5],
        },
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
                { text: "Codigo Interno", fillColor: "#ecedee", fontSize: 8 },
                { text: "Codigo Barras", fillColor: "#ecedee", fontSize: 8 },
                { text: "Descripcion", fillColor: "#ecedee", fontSize: 8 },
                { text: "Vencimiento", fillColor: "#ecedee", fontSize: 8 },
                { text: "Lote", fillColor: "#ecedee", fontSize: 8 },
                { text: "Cantidad", fillColor: "#ecedee", fontSize: 8 },
                { text: "Ubi./Sub Ubi.", fillColor: "#ecedee", fontSize: 8 },
                { text: "Stock", fillColor: "#ecedee", fontSize: 8 },
              ],
              ...pedidoData.articulos.map((articulo) => [
                { text: articulo.cod_interno, fontSize: 6 },
                { text: articulo.cod_barras, fontSize: 6 },
                { text: articulo.descripcion, fontSize: 6 },
                { text: articulo.vencimiento, fontSize: 6 },
                { text: articulo.lote, fontSize: 6 },
                { text: articulo.cantidad, fontSize: 6 },
                { text: `${articulo.ubicacion}/${articulo.sububicacion}`, fontSize: 6 },
                { text: articulo.stock, fontSize: 6 },
              ]),
            ],
          },
        },
      ],
      styles: {
        tableHeader: {
          bold: true,
          fontSize: 8,
          color: "black",
        },
        tableBody: {
          fontSize: 6,
        },
      },
      defaultStyle: {
        fontSize: 6,
      },
    };

    await generatePDF(
      docDefinition as any,
      action === "print" ? "print" : "download"
    );
    onComplete?.();
    console.log("PDF generado con éxito");
  } catch (error) {
    console.error("Error al generar PDF:", error);
    console.log("Error al generar PDF:", error);
    onError?.(error);
  }
};


  return (
    null
  );
};


export default DocumentoPreparacion;
