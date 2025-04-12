
import { FiltrosPedidoFaltante, PedidoFaltante } from "../types/shared.type";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

interface ReportePedidosFaltantesExcelProps {
  filtros: FiltrosPedidoFaltante;
  pedidosFaltantes: PedidoFaltante[];
  onComplete: () => void;
  onError: (error: string) => void;
}

export const ReportePedidosFaltantesExcel = ({
  pedidosFaltantes,
  onComplete,
  onError,
}: ReportePedidosFaltantesExcelProps) => {
  const [, setIsLoading] = useState(false);


  useEffect(() => {
    if (pedidosFaltantes && pedidosFaltantes.length > 0) {
      generarExcel(pedidosFaltantes);
    }
  }, [pedidosFaltantes]);

  const generarExcel = async (data: PedidoFaltante[]) => {
    if (!data || data.length === 0) {
      onError("No hay datos disponibles para generar el reporte");
      return;
    }

    try {
      setIsLoading(true);

      // Crear un nuevo libro de Excel
      const wb = XLSX.utils.book_new();

      // Preparar los datos para la hoja
      const datosExcel = data.map((pedido) => ({
        "ID Pedido": pedido.id_pedido,
        "Fecha": pedido.fecha,
        "Cliente": pedido.cliente,
        "Cód. Barras": pedido.cod_barra,
        "Descripción": pedido.descripcion,
        "Marca": pedido.marca,
        "Cant. Pedido": pedido.cantidad_pedido,
        "Cant. Faltante": pedido.cantidad_faltante,
        "P. Unitario": pedido.p_unitario,
        "Subtotal": pedido.subtotal,
        "Operador": pedido.operador,
        "Vendedor": pedido.vendedor,
      }));

      // Crear la hoja de Excel
      const ws = XLSX.utils.json_to_sheet(datosExcel);

      // Ajustar el ancho de las columnas
      const columnWidths = [
        { wch: 10 }, // ID Pedido
        { wch: 15 }, // Fecha
        { wch: 30 }, // Cliente
        { wch: 15 }, // Cód. Barras
        { wch: 40 }, // Descripción
        { wch: 20 }, // Marca
        { wch: 12 }, // Cant. Pedido
        { wch: 12 }, // Cant. Faltante
        { wch: 12 }, // P. Unitario
        { wch: 12 }, // Subtotal
        { wch: 20 }, // Operador
        { wch: 20 }, // Vendedor
      ];
      ws["!cols"] = columnWidths;

      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, "Pedidos Faltantes");

      // Generar el archivo Excel
      const fecha = new Date().toISOString().split("T")[0];
      const nombreArchivo = `Pedidos_Faltantes_${fecha}.xlsx`;
      XLSX.writeFile(wb, nombreArchivo);

      setIsLoading(false);
      onComplete();
    } catch (error) {
      console.error("Error al generar el Excel:", error);
      setIsLoading(false);
      onError("Error al generar el Excel");
    }
  };

  return null;
};
