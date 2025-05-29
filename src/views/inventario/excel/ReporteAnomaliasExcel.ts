import * as XLSX from "xlsx";

interface ReporteAnomalias {
  id_inventario: number;
  fecha: string;
  fecha_cierre: string;
  hora: string;
  hora_cierre: string;
  operador: number;
  operador_nombre: string;
  nombre_sucursal: string;
  nombre_deposito: string;
  estado_inventario: string;
  nro_inventario: number;
  items: [
    {
      articulo_id: number;
      articulo: string;
      cod_interno: string;
      items_lotes: [
        {
          cod_barras: string;
          vencimiento: string;
          lote_id: number;
          lote: string;
          cantidad_inicial: number;
          cantidad_scanner: number;
          items_vendidos: number;
          items_devueltos: number;
          items_comprados: number;
          cantidad_actual: number;
          diferencia: number;
          costo_diferencia: number;
        }
      ];
      ubicacion: string;
      sub_ubicacion: string;
      cantidad_inicial_total: number;
      cantidad_scanner_total: number;
      diferencia_total: number;
      costo_diferencia_total: number;
    }
  ];
}

export const generarReporteAnomaliasExcel = (reporte: ReporteAnomalias) => {
  // Crear el libro de trabajo
  const wb = XLSX.utils.book_new();

  // Preparar los datos para la hoja de lotes (cada lote es una fila)
  const lotesData: any[] = [];
  
  reporte.items.forEach((item) => {
    item.items_lotes.forEach((lote) => {
      lotesData.push({
        "ID Artículo": item.articulo_id,
        "Artículo": item.articulo,
        "Código Interno": item.cod_interno,
        "Ubicación": item.ubicacion,
        "Sub-ubicación": item.sub_ubicacion,
        "ID Lote": lote.lote_id,
        "Lote": lote.lote,
        "Código de Barras": lote.cod_barras,
        "Vencimiento": lote.vencimiento,
        "Cantidad Inicial": lote.cantidad_inicial,
        "Cantidad Scanner": lote.cantidad_scanner,
        "Items Vendidos": lote.items_vendidos,
        "Items Devueltos": lote.items_devueltos,
        "Items Comprados": lote.items_comprados,
        "Cantidad Actual": lote.cantidad_actual,
        "Diferencia": lote.diferencia,
        "Costo Diferencia": lote.costo_diferencia,
      });
    });
  });

  // Crear la hoja de lotes
  const wsLotes = XLSX.utils.json_to_sheet(lotesData);

  // Preparar los datos para la hoja de información del inventario
  const infoInventarioData = [
    ["Información del Inventario", ""],
    ["ID Inventario", reporte.id_inventario],
    ["Número de Inventario", reporte.nro_inventario],
    ["Fecha", reporte.fecha],
    ["Hora", reporte.hora],
    ["Fecha Cierre", reporte.fecha_cierre],
    ["Hora Cierre", reporte.hora_cierre],
    ["Operador", reporte.operador_nombre],
    ["Sucursal", reporte.nombre_sucursal],
    ["Depósito", reporte.nombre_deposito],
    ["Estado", reporte.estado_inventario],
    ["", ""],
    ["Resumen por Artículo", ""],
  ];

  // Agregar resumen por artículo
  reporte.items.forEach((item) => {
    infoInventarioData.push([
      `${item.articulo} (${item.cod_interno})`,
      ""
    ]);
    infoInventarioData.push([
      "  Cantidad Inicial Total",
      item.cantidad_inicial_total
    ]);
    infoInventarioData.push([
      "  Cantidad Scanner Total",
      item.cantidad_scanner_total
    ]);
    infoInventarioData.push([
      "  Diferencia Total",
      item.diferencia_total
    ]);
    infoInventarioData.push([
      "  Costo Diferencia Total",
      item.costo_diferencia_total
    ]);
    infoInventarioData.push(["", ""]);
  });

  // Crear la hoja de información
  const wsInfo = XLSX.utils.aoa_to_sheet(infoInventarioData);

  // Preparar datos para hoja de resumen general
  const totalCantidadInicial = reporte.items.reduce((sum, item) => sum + item.cantidad_inicial_total, 0);
  const totalCantidadScanner = reporte.items.reduce((sum, item) => sum + item.cantidad_scanner_total, 0);
  const totalDiferencia = reporte.items.reduce((sum, item) => sum + item.diferencia_total, 0);
  const totalCostoDiferencia = reporte.items.reduce((sum, item) => sum + item.costo_diferencia_total, 0);
  const totalLotes = reporte.items.reduce((sum, item) => sum + item.items_lotes.length, 0);

  const resumenGeneralData = [
    ["Resumen General", ""],
    ["Total de Artículos", reporte.items.length],
    ["Total de Lotes", totalLotes],
    ["Cantidad Inicial Total", totalCantidadInicial],
    ["Cantidad Scanner Total", totalCantidadScanner],
    ["Diferencia Total", totalDiferencia],
    ["Costo Diferencia Total", totalCostoDiferencia],
  ];

  const wsResumenGeneral = XLSX.utils.aoa_to_sheet(resumenGeneralData);

  // Ajustar el ancho de las columnas para la hoja de lotes
  const lotesColWidth = [
    { wch: 12 }, // ID Artículo
    { wch: 30 }, // Artículo
    { wch: 15 }, // Código Interno
    { wch: 15 }, // Ubicación
    { wch: 15 }, // Sub-ubicación
    { wch: 10 }, // ID Lote
    { wch: 15 }, // Lote
    { wch: 15 }, // Código de Barras
    { wch: 12 }, // Vencimiento
    { wch: 12 }, // Cantidad Inicial
    { wch: 12 }, // Cantidad Scanner
    { wch: 12 }, // Items Vendidos
    { wch: 12 }, // Items Devueltos
    { wch: 12 }, // Items Comprados
    { wch: 12 }, // Cantidad Actual
    { wch: 12 }, // Diferencia
    { wch: 15 }, // Costo Diferencia
  ];

  wsLotes["!cols"] = lotesColWidth;

  // Ajustar el ancho de las columnas para las otras hojas
  wsInfo["!cols"] = [
    { wch: 25 }, // Títulos
    { wch: 20 }, // Valores
  ];

  wsResumenGeneral["!cols"] = [
    { wch: 25 }, // Títulos
    { wch: 20 }, // Valores
  ];

  // Agregar las hojas al libro
  XLSX.utils.book_append_sheet(wb, wsLotes, "Detalle por Lotes");
  XLSX.utils.book_append_sheet(wb, wsInfo, "Información del Inventario");
  XLSX.utils.book_append_sheet(wb, wsResumenGeneral, "Resumen General");

  // Generar el archivo
  const fileName = `Reporte_Anomalias_Inventario_${reporte.nro_inventario}_${
    new Date().toISOString().split("T")[0]
  }.xlsx`;
  XLSX.writeFile(wb, fileName);
};