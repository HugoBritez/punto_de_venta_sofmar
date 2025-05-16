import { useEffect} from "react";
import { useSucursalStore } from "@/stores/sucursalStore";
import { generatePDF } from "@/shared/services/pdfService";

interface ItemsFaltantesDocProps {
    id_pedido: number;
    fecha_pedido: string;
    vendedor: string;
    cliente: string;
    onComplete: () => void;
    onError: (error: any) => void;
    items: {
        codigo_barra: string;
        descripcion: string;
        cantidad: number;
        lote: string;
        vencimiento: string;
    }[];
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


export default function ItemsFaltantesDoc({
  id_pedido,
  fecha_pedido,
  vendedor,
  cliente,
  items,
  onComplete,
  onError,
}: ItemsFaltantesDocProps) {
  console.log("ItemsFaltantesDoc iniciado");
  
  const { sucursalData, fetchSucursalData } = useSucursalStore((state) => ({
    sucursalData: state.sucursalData,
    fetchSucursalData: state.fetchSucursalData,
  }));

  const generarPDF = async (sucursalData: SucursalData) => {
    try {
      console.log("Iniciando generación de PDF");

      const docDefinition = {
        pageSize: {
          width: 595.28, // Tamaño A4
          height: 841.89,
        },
        pageMargins: [20, 20, 20, 20],
        info: {
          title: "Artículos Faltantes",
          author: sucursalData?.nombre_emp || "Sistema",
          subject: "Reporte de Artículos Faltantes",
          keywords: "faltantes, inventario",
        },
        content: [
          // Cabecera
          {
            columns: [
              {
                text: `Empresa: ${sucursalData?.nombre_emp || ""}`,
                fontSize: 8,
                width: "*",
                alignment: "center",
              },
              {
                text: `RUC: ${sucursalData?.ruc_emp || ""}`,
                fontSize: 8,
                width: "*",
                alignment: "center",
              },
              {
                text: new Date().toLocaleDateString("es-ES"),
                fontSize: 8,
                width: "*",
                alignment: "center",
              },
            ],
            columnGap: 10,
            margin: [0, 0, 0, 10],
          },
          {
            text: "ARTÍCULOS FALTANTES",
            style: "header",
            margin: [0, 10, 0, 10],
          },
          {
            columns: [
              { text: `Pedido Nro: ${id_pedido}`, fontSize: 10 },
              { text: `Fecha: ${fecha_pedido}`, fontSize: 10 },
              { text: `Vendedor: ${vendedor}`, fontSize: 10 },
              { text: `Cliente: ${cliente}`, fontSize: 10 },
            ],
            columnGap: 10,
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              headerRows: 1,
              widths: ["auto", "*", "auto", "auto", "auto"],
              body: [
                [
                  { text: "Cod. Barras", style: "tableHeader" },
                  { text: "Descripción", style: "tableHeader" },
                  { text: "Cantidad", style: "tableHeader" },
                  { text: "Lote", style: "tableHeader" },
                  { text: "Vencimiento", style: "tableHeader" },
                ],
                ...items.map((item) => [
                  { text: item.codigo_barra, fontSize: 8 },
                  { text: item.descripcion, fontSize: 8 },
                  { text: item.cantidad.toString(), fontSize: 8 },
                  { text: item.lote, fontSize: 8 },
                  { text: item.vencimiento, fontSize: 8 },
                ]),
              ],
            },
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
        },
      };

      console.log("Llamando a generatePDF");
      const result = await generatePDF(docDefinition as any, "print");
      console.log("Resultado de generatePDF:", result);

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
    console.log('trayendo datos de la sucursal')
    if (!sucursalData) {
      fetchSucursalData();
    }
  }, []);

  useEffect(() => {
    if (sucursalData) {
      console.log('datos de la sucursal', sucursalData);
      const sucursalActual = Array.isArray(sucursalData) ? sucursalData[0] : sucursalData;
      generarPDF(sucursalActual);
    }
  }, [sucursalData]);

  return null;
}