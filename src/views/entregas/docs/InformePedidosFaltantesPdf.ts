import { Configuraciones } from "@/types/shared_interfaces";
import { api_url } from "@/utils";
import { generatePDF } from "@/services/pdfService";
import { FiltrosPedidoFaltante, PedidoFaltante } from "../types/shared.type";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useClientesStore } from "@/stores/clientesStore";
import { useOperadoresStore } from "@/stores/operadoresStore";
import { useCategoriasStore } from "@/stores/categoriasStore";
import { useSubCategoriasStore } from "@/stores/subCategoriasStore";
import { useDvlStore } from "@/stores/dvlStore";
import { useLineasStore } from "@/stores/lineasStore";
import { useMarcasStore } from "@/stores/marcasStore";

interface ReportePedidosFaltantesProps {
  filtros: FiltrosPedidoFaltante;
  pedidosFaltantes: PedidoFaltante[];
  onComplete: () => void;
  onError: (error: string) => void;
}

export const ReportePedidosFaltantesPdf = ({
  filtros,
  pedidosFaltantes,
  onComplete,
  onError,
}: ReportePedidosFaltantesProps) => {
  const [configuraciones, setConfiguraciones] = useState<Configuraciones[]>([]);
  const [, setIsLoading] = useState(false);
  const nombreEmpresa = configuraciones[0]?.valor || "N/A";
  const rucEmpresa = configuraciones[30]?.valor || "N/A";
  const fechaActual = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const usuario = sessionStorage.getItem("user_name");

  // Obtener las funciones para obtener descripciones
  const { obtenerClientePorId } = useClientesStore();
  const { obtenerOperadorPorId } = useOperadoresStore();
  const { obtenerCategoriaPorId } = useCategoriasStore();
  const { obtenerSubCategoriaPorId } = useSubCategoriasStore();
  const { obtenerDvlPorId } = useDvlStore();
  const { obtenerLineaPorId } = useLineasStore();
  const { obtenerMarcaPorId } = useMarcasStore();

  const fetchConfiguraciones = async () => {
    try {
      const response = await axios.get(`${api_url}configuraciones/todos`);
      setConfiguraciones(response.data.body);
    } catch (error) {
      console.error("Error al obtener las configuraciones:", error);
      onError("Error al obtener las configuraciones");
    }
  };

  useEffect(() => {
    fetchConfiguraciones();
  }, [pedidosFaltantes]);

  useEffect(() => {
    if (pedidosFaltantes && pedidosFaltantes.length > 0 && configuraciones.length > 0) {
      generarPDF(pedidosFaltantes);
    }
  }, [ configuraciones]);

  const generarPDF = async (data: PedidoFaltante[]) => {
    if (!data || data.length === 0) {
      onError("No hay datos disponibles para generar el reporte");
      return;
    }

    try {
      setIsLoading(true);
      
      // Obtener descripciones de los filtros
      const clienteDesc = filtros.cliente && filtros.cliente > 0 ? obtenerClientePorId(filtros.cliente)?.descripcion : "Todos";
      const vendedorDesc = filtros.vendedor && filtros.vendedor > 0 ? obtenerOperadorPorId(filtros.vendedor)?.descripcion : "Todos";
      const categoriaDesc = filtros.categoria && filtros.categoria > 0 ? obtenerCategoriaPorId(filtros.categoria)?.descripcion : "Todos";
      const subcategoriaDesc = filtros.subcategoria && filtros.subcategoria > 0 ? obtenerSubCategoriaPorId(filtros.subcategoria)?.descripcion : "Todos";
      const dvlDesc = filtros.dvl && filtros.dvl > 0 ? obtenerDvlPorId(filtros.dvl)?.descripcion : "Todos";
      const lineaDesc = filtros.linea && filtros.linea > 0 ? obtenerLineaPorId(filtros.linea)?.descripcion : "Todos";
      const marcaDesc = filtros.marca && filtros.marca > 0 ? obtenerMarcaPorId(filtros.marca)?.descripcion : "Todos";

      const docDefinition = {
        pageSize: "A4",
        pageMargins: [20, 20, 20, 20],
        content: [
          //### HEADER ###
          {
            columns: [
              {
                text: `RUC: ${rucEmpresa}`,
                fontSize: 7,
                margin: [0, 0, 0, 10],
                width: "auto",
              },
              {
                text: `${nombreEmpresa}`,
                fontSize: 7,
                bold: true,
                margin: [0, 0, 0, 10],
                width: "*",
                alignment: "center",
              },
              {
                stack: [
                  {
                    text: fechaActual,
                    fontSize: 7,
                    alignment: "right",
                    margin: [0, 0, 0, 5],
                    width: "*",
                  },
                  {
                    text: usuario,
                    fontSize: 7,
                    alignment: "right",
                    margin: [0, 0, 0, 0],
                    width: "*",
                  },
                ],
                width: "auto",
              },
            ],
          },
          {
            canvas: [{ type: "line", x1: 0, y1: 0, x2: 595, y2: 0 }],
          },
          {
            text: "REPORTE DE PEDIDOS FALTANTES",
            alignment: "center",
            fontSize: 10,
            bold: true,
            margin: [0, 10],
          },
          {
            columns: [
              {
                text: `Fecha desde: ${filtros.fecha_desde}`,
                fontSize: 8,
              },
              {
                text: `Fecha hasta: ${filtros.fecha_hasta}`,
                fontSize: 8,
              },
              {
                text: `Cliente: ${clienteDesc}`,
                fontSize: 8,
              },
              {
                text: `Vendedor: ${vendedorDesc}`,
                fontSize: 8,
              },
              {
                text: `Categoria: ${categoriaDesc}`,
                fontSize: 8,
              },
            ],
          },
          {
            columns: [
              {
                text: `Articulo: ${filtros.articulo || "Todos"}`,
                fontSize: 8,
              },
              {
                text: `DVL: ${dvlDesc}`,
                fontSize: 8,
              },
              {
                text: `Linea: ${lineaDesc}`,
                fontSize: 8,
              },
              {
                text: `Marca: ${marcaDesc}`,
                fontSize: 8,
              },
              {
                text: `Subcategoria: ${subcategoriaDesc}`,
                fontSize: 8,
              },
            ],
            columnGap: 10,
            margin: [0, 5, 0, 10],
          },
          {
            canvas: [{ type: "line", x1: 0, y1: 0, x2: 595, y2: 0 } ] ,
            margin: [0, 5, 0, 10],
          },
          {
            table: {
              widths: [
                "auto",
                "auto",
                "auto",
                "auto",
                "*",
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
              ],
              body: [
                // Encabezados de la tabla
                [
                  { text: "ID Pedido", style: "tableHeader", fontSize: 8 },
                  { text: "Fecha", style: "tableHeader", fontSize: 8 },
                  { text: "Cliente", style: "tableHeader", fontSize: 8 },
                  { text: "Cód. Barras", style: "tableHeader", fontSize: 8 },
                  { text: "Descripción", style: "tableHeader", fontSize: 8 },
                  { text: "Marca", style: "tableHeader", fontSize: 8 },
                  { text: "Cant. Pedido", style: "tableHeader", fontSize: 8 },
                  { text: "Cant. Faltante", style: "tableHeader", fontSize: 8 },
                  { text: "P. Unitario", style: "tableHeader", fontSize: 8 },
                  { text: "Subtotal", style: "tableHeader", fontSize: 8 },
                  { text: "Operador", style: "tableHeader", fontSize: 8 },
                  { text: "Vendedor", style: "tableHeader", fontSize: 8 },
                ],
                // Datos de los pedidos
                ...data.map((pedido) => [
                  { text: pedido.id_pedido, fontSize: 7 },
                  { text: pedido.fecha, fontSize: 7 },
                  { text: pedido.cliente, fontSize: 7 },
                  { text: pedido.cod_barra, fontSize: 7 },
                  { text: pedido.descripcion, fontSize: 7 },
                  { text: pedido.marca, fontSize: 7 },
                  { text: pedido.cantidad_pedido, fontSize: 7 },
                  { text: pedido.cantidad_faltante, fontSize: 7 },
                  { text: pedido.p_unitario, fontSize: 7 },
                  { text: pedido.subtotal, fontSize: 7 },
                  { text: pedido.operador, fontSize: 7 },
                  { text: pedido.vendedor, fontSize: 7 },
                ]),
              ],
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
              margin: [0, 5, 0, 5],
            },
          },
          {
            text: `Total de registros: ${data.length}`,
            alignment: "right",
            fontSize: 8,
            margin: [0, 10, 0, 0],
          },
        ],
        styles: {
          tableHeader: {
            bold: true,
            fontSize: 8,
            fillColor: "#1e40af",
            alignment: "center",
            color: "white",
          },
        },
        defaultStyle: {
          fontSize: 8,
        },
      };

      await generatePDF(docDefinition as any, "download");
      setIsLoading(false);
      onComplete();
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      setIsLoading(false);
      onError("Error al generar el PDF");
    }
  };

  return null;
};
