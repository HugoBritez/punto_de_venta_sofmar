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
  diferencia: number;
  categoria: string;
  categoria_id: number;
  subcategoria: string;
  subcategoria_id: number;
  deposito: string;
  fecha_inventario: string;
  lote: string;
  marca: string;
  nro_inventario: string;
  precio_compra: string;
  precio_compra_numero: string;
  precio_venta: string;
  precio_venta_numero: string;
  sucursal: string;
  tipo_diferencia: 'GANANCIA' | 'PERDIDA' | 'SIN CAMBIO';
  valor_diferencia: string;
  valor_diferencia_numero: string;
  vencimiento: string;
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
  id_inventario: number;
  onComplete?: () => void;
  onError?: (error: any) => void;
}

export default function ReporteItemsScaneados({
  id_inventario,
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

  const generarPDF = async () => {
    try {
      const response = await axios.get(`${api_url}inventarios/reporte`, {
        params: {
          id_inventario,
        },
      });

      const { items, resumen } = response.data.body;

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
                text: `Empresa: ${sucursalData?.nombre_emp || ''}`,
                fontSize: 8,
                width: "*",
              },
              {
                text: `RUC: ${sucursalData?.ruc_emp || ''}`,
                fontSize: 8,
                width: "*",
              },
              {
                text: new Date().toLocaleDateString("es-ES"),
                fontSize: 8,
                width: "*"
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
                text: `Nro. Inventario: ${items[0]?.nro_inventario || ''}`,
                fontSize: 8,
                width: "*",
              },
              {
                text: `Sucursal: ${items[0]?.sucursal || ''}`,
                fontSize: 8,
                width: "*",
              },
              {
                text: `Deposito: ${items[0]?.deposito || ''}`,
                fontSize: 8,
                width: "*"
              },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            table: {
              headerRows: 1,
              widths: ["*", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
              body: [
                [
                  { text: "Descripción", style: "tableHeader" },
                  { text: "Lote", style: "tableHeader" },
                  { text: "Cant. Inicial", style: "tableHeader" },
                  { text: "Cant. Scanner", style: "tableHeader" },
                  { text: "Cant. Actual", style: "tableHeader" },
                  { text: "Diferencia", style: "tableHeader" },
                  { text: "Tipo", style: "tableHeader" },
                  { text: "Categoría", style: "tableHeader" },
                  { text: "Precio Compra", style: "tableHeader" },
                  { text: "Precio Venta", style: "tableHeader" },
                  { text: "Valor Dif.", style: "tableHeader" },
                ],
                ...items.map((item: ItemInventario) => [
                  { text: item.descripcion, fontSize: 6 },
                  { text: item.lote, fontSize: 6 },
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
                  { text: item.categoria.trim(), fontSize: 6 },
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
              `Total Items: ${resumen.total_items}\n`,
              `Items con Ganancia: ${resumen.total_ganancias}\n`,
              `Items con Pérdida: ${resumen.total_perdidas}\n`,
              `Valor Total Ganancias: ${resumen.valor_ganancias_formato}\n`,
              `Valor Total Pérdidas: ${resumen.valor_perdidas_formato}\n`,
              `Valor Diferencia Neto: ${resumen.valor_diferencia_neto_formato}\n`,
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
