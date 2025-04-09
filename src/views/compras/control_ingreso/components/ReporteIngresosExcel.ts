import * as XLSX from "xlsx";
import { ReporteIngresos, FiltrosDTO } from "../types/shared.type";
import { useIngresos } from "../hooks/useIngresos";
import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";

interface GenerarExcelProps {
  filtros: FiltrosDTO;
  onComplete?: () => void;
  onError?: (error: any) => void;
}

export const InformeIngresosExcel = ({
  filtros,
  onComplete,
  onError,
}: GenerarExcelProps) => {
  const { generarReporteIngresos, reporteIngresos } = useIngresos();
  const [, setIsLoading] = useState(false);
  const toast = useToast();
  const fechaCompletaActual = new Date().toLocaleString();

  useEffect(() => {
    console.log("InformeIngresosExcel - Filtros recibidos:", filtros);
    const generarExcel = async () => {
      setIsLoading(true);
      try {
        console.log("Iniciando generación de reporte...");
        await generarReporteIngresos(filtros);
        console.log("Reporte generado exitosamente");
      } catch (error) {
        console.error("Error al generar reporte:", error);
        toast({
          title: "Error",
          description: "Ocurrió un error al generar el reporte",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    };

    console.log('Iniciando proceso de generación de Excel');
    generarExcel();
  }, [filtros]);

  useEffect(() => {
    console.log("ReporteIngresos actualizado:", reporteIngresos);
    if (reporteIngresos && reporteIngresos.length > 0) {
      console.log("Generando archivo Excel con", reporteIngresos.length, "registros");
      generarArchivoExcel(reporteIngresos);
    } else {
      console.log("No hay datos para generar el Excel");
    }
  }, [reporteIngresos]);

  const generarArchivoExcel = (resumenIngresos: ReporteIngresos[]) => {
    try {
      console.log("Iniciando generación de archivo Excel...");
      // Crear el libro de trabajo
      const wb = XLSX.utils.book_new();

      // Crear una única hoja con información detallada
      const detallesUnificados = resumenIngresos.flatMap((ingreso) =>
        ingreso.items.map((detalle) => ({
          "Código Ingreso": ingreso.id_orden,
          "Fecha": ingreso.fecha_compra,
          "Depósito": ingreso.deposito_descripcion,
          "Proveedor": ingreso.proveedor,
          "Estado": ingreso.estado,
          "Nro. Factura": ingreso.nro_factura,
          "Responsable Ubicación": ingreso.responsable_ubicacion,
          "Artículo": detalle.articulo_descripcion,
          "Código Barras": detalle.articulo_codigo_barras,
          "Cantidad Solicitada": detalle.cantidad,
          "Cantidad Verificada": detalle.cantidad_verificada,
          "Diferencia": detalle.cantidad - detalle.cantidad_verificada,
          "Lote": detalle.lote,
          "Vencimiento": detalle.vencimiento,
        }))
      );

      console.log("Datos unificados preparados:", detallesUnificados.length, "registros");

      // Anchos de columna para la hoja unificada
      const wscolsUnificados = [
        { wch: 15 }, // Código Ingreso
        { wch: 20 }, // Fecha
        { wch: 25 }, // Depósito
        { wch: 30 }, // Proveedor
        { wch: 15 }, // Estado
        { wch: 15 }, // Nro. Factura
        { wch: 25 }, // Responsable Ubicación
        { wch: 40 }, // Artículo
        { wch: 20 }, // Código Barras
        { wch: 15 }, // Cantidad Solicitada
        { wch: 15 }, // Cantidad Verificada
        { wch: 12 }, // Diferencia
        { wch: 15 }, // Lote
        { wch: 15 }, // Vencimiento
      ];

      // Crear la hoja
      const wsUnificado = XLSX.utils.json_to_sheet(detallesUnificados);

      console.log("Hoja de Excel creada");

      // Aplicar estilos a los encabezados
      const headerStyle = {
        font: { bold: true },
        fill: { fgColor: { rgb: "D9D9D9" } },
        alignment: { horizontal: "center" }
      };

      // Aplicar estilos a los encabezados
      Object.keys(detallesUnificados[0]).forEach((key, index) => {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
        if (!wsUnificado[cellRef]) wsUnificado[cellRef] = { v: key };
        wsUnificado[cellRef].s = headerStyle;
      });

      // Aplicar anchos de columna
      wsUnificado["!cols"] = wscolsUnificados;

      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(wb, wsUnificado, "Reporte Detallado");

      console.log("Preparando para guardar archivo...");

      // Guardar el archivo
      XLSX.writeFile(wb, `informe_ingresos_detallado_${fechaCompletaActual}.xlsx`);
      
      console.log("Archivo Excel generado exitosamente");
      
      toast({
        title: "Excel generado",
        description: "El archivo Excel se ha generado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onComplete?.();
    } catch (error) {
      console.error("Error al generar Excel:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al generar el archivo Excel",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      onError?.(error);
    }
  };

  return null;
};
