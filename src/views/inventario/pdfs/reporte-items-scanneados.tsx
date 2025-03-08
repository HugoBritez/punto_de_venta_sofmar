import { useEffect, useState } from "react";
import { generatePDF } from "@/services/pdfService";
import { useSucursalStore } from "@/stores/sucursalStore";
import axios from "axios";
import { api_url } from "@/utils";

interface ItemInventario {
  id_articulo: number;
  id_lote: number;
  descripcion: string;
  cod_ref: string;
  codigo_barra: string;
  cantidad_inicial: number;
  cantidad_scanner: number | null;
  cantidad_actual: number;
  ca_codigo: number;
  ca_descripcion: string;
  sc_codigo: number;
  sc_descripcion: string;
  precio_compra: string;
  precio_venta: string;
  diferencia: number;
  tipo_diferencia: 'GANANCIA' | 'PERDIDA' | 'SIN CAMBIO';
  valor_diferencia: string;
}

interface SucursalData {
  id: number;
  descripcion: string;
  direccion: string;
  tel: string;
  nombre_emp: string;
  ruc_emp: string;
  matriz: number;
}

interface ReporteItemsScaneadosProps {
  nro_inventario: number;
  sucursal: number;
  deposito: number;
  onComplete?: () => void;
  onError?: (error: any) => void;
}

export default function ReporteItemsScaneados({
  nro_inventario,
  sucursal,
  deposito,
  onComplete,
  onError,
}: ReporteItemsScaneadosProps) {
const [sucursalData, setSucursalData] = useState<SucursalData | null>(null);
  console.log(sucursalData);

  const fetchSucursalData = async () => {
    if (useSucursalStore.getState().sucursalData) {
      console.log("Sucursal data already exists");
      console.log(useSucursalStore.getState().sucursalData);
      return;
   }
   try {
     console.log("Fetching sucursal data");
     const response = await axios.get(`${api_url}sucursales/sucursal-data`);
     setSucursalData(response.data.body[0]);
   } catch (error) {
     console.error("Error al obtener datos de la sucursal:", error);
   }
 };

  const obtenerDatosReporte = async () => {
    try {
      const response = await axios.get(`${api_url}articulos/reporte-inventario`, {
        params: {
          nro_inventario,
          sucursal,
          deposito,
        },
      });
      return response.data.body as ItemInventario[];
    } catch (error) {
      console.error("Error al obtener datos del reporte:", error);
      throw error;
    }
  };

  const generarPDF = async () => {
    try {
      const items = await obtenerDatosReporte();

      const docDefinition = {
        pageSize: "A4",
        pageMargins: [20, 20, 20, 20],
        info: {
          title: "Reporte de Inventario",
          author: sucursalData?.nombre_emp || "Sistema",
          subject: "Reporte de Items Inventariados",
        },
        content: [
          // Cabecera
          {
            columns: [
              {
                text: `Empresa: Zimmer Centro de Compras`,
                fontSize: 8,
                width: "*",
              },
              {
                text: `RUC: 80073411-4`,
                fontSize: 8,
                width: "*",
              },
              {
                text: new Date().toLocaleDateString("es-ES"),
                fontSize: 8,
                width:  "*"
              },
            ],
            columnGap: 10,
            margin: [0, 0, 0, 10],
          },
          {
            text: "REPORTE DE INVENTARIO",
            style: "header",
            margin: [0, 10, 0, 10],
          },
          {
            columns: [
              {
                text: `Nro. Inventario: 1`,
                fontSize: 8,
                width: "*",
              },
              {
                text: `Sucursal: Centro de Compras`,
                fontSize: 8,
                width: "*",
              },
              {
                text: `Deposito: DEPOSITO GRAL`,
                fontSize: 8,
                width:  "*"
              },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            table: {
              headerRows: 1,
              widths: [ "*", "auto", "auto", "auto", "auto",  "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
              body: [
                [
                  { text: "Descripción", style: "tableHeader" },
                  { text: "Cod. Ref.", style: "tableHeader" },
                  { text: "Cód. Barras", style: "tableHeader" },
                  { text: "Cant. Inicial", style: "tableHeader" },
                  { text: "Cant. Scanner", style: "tableHeader" },
                  { text: "Cant. Actual", style: "tableHeader" },
                  { text: "Diferencia", style: "tableHeader" },
                  { text: "Tipo", style: "tableHeader" },
                  { text: "Categoria", style: "tableHeader" },
                  { text: "Precio Compra", style: "tableHeader" },
                  { text: "Precio Venta", style: "tableHeader" },
                  { text: "Valor Dif.", style: "tableHeader" },
                ],
                ...items.map((item) => [
                  { text: item.descripcion, fontSize: 6 },
                  { text: item.cod_ref, fontSize: 6 },
                  { text: item.codigo_barra, fontSize: 6 },
                  { text: item.cantidad_inicial.toString(), fontSize: 6 },
                  { text: item.cantidad_scanner?.toString() || "0", fontSize: 6 },
                  { text: item.cantidad_actual.toString(), fontSize: 6 },
                  { 
                    text: item.diferencia.toString(), 
                    fontSize: 6,
                    color: item.diferencia < 0 ? 'red' : 
                           item.diferencia > 0 ? 'green' : 'black'
                  },
                  { 
                    text: item.tipo_diferencia,
                    fontSize: 6,
                    color: item.tipo_diferencia === 'GANANCIA' ? 'green' : 
                           item.tipo_diferencia === 'PERDIDA' ? 'red' : 'black'
                  },
                  { text: item.ca_descripcion, fontSize: 6 },
                  { text: item.precio_compra, fontSize: 6 },
                  { text: item.precio_venta, fontSize: 6 },
                  { text: item.valor_diferencia, fontSize: 6 },
                ]),
              ],
            },
          },
          {
            text: [
              { text: "\nResumen:\n", bold: true },
              `Total Items: ${items.length}\n`,
              `Items con Ganancia: ${items.filter(i => i.tipo_diferencia === 'GANANCIA').length}\n`,
              `Items con Pérdida: ${items.filter(i => i.tipo_diferencia === 'PERDIDA').length}\n`,
              `Items Sin Cambio: ${items.filter(i => i.tipo_diferencia === 'SIN CAMBIO').length}\n`,
              `Fecha de Generación: ${new Date().toLocaleString("es-ES")}`,
            ],
            style: "footer",
            margin: [0, 20, 0, 0],
          },
        ],
        styles: {
          header: {
            fontSize: 12,
            bold: true,
            alignment: "center",
          },
          tableHeader: {
            fontSize: 8,
            bold: true,
            fillColor: "#ecedee",
          },
          footer: {
            fontSize: 8,
            margin: [0, 20, 0, 0],
          },
        },
      };

      const result = await generatePDF(docDefinition as any, "print");

      if (result.success) {
        console.log("PDF generado exitosamente");
        onComplete?.();
      } else {
        console.error("Error al generar PDF:", result.message);
        onError?.(result.message);
      }
    } catch (error) {
      console.error("Error en generarPDF:", error);
      onError?.(error);
    }
  };

  useEffect(() => {
    fetchSucursalData();
  }, []);

  useEffect(() => {
    generarPDF();
  }, [sucursalData]);

  return null;
}
