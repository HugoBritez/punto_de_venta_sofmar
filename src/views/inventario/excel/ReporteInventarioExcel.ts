import * as XLSX from "xlsx";

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
  tipo_diferencia: "GANANCIA" | "PERDIDA" | "SIN CAMBIO";
  valor_diferencia: string;
  valor_diferencia_numero: string;
  vencimiento: string;
}

interface ResumenInventario {
  total_items: number;
  total_ganancias: number;
  total_perdidas: number;
  valor_ganancias: number;
  valor_perdidas: number;
  valor_diferencia_neto: number;
  valor_ganancias_formato: string;
  valor_perdidas_formato: string;
  valor_diferencia_neto_formato: string;
}

interface ReporteInventario {
  items: ItemInventario[];
  resumen: ResumenInventario;
}

export const generarExcelReporteInventario = (reporte: ReporteInventario) => {
  // Crear el libro de trabajo
  const wb = XLSX.utils.book_new();

  // Preparar los datos para la hoja de items
  const itemsData = reporte.items.map((item) => ({
    Código: item.cod_ref,
    "Código de Barras": item.codigo_barra,
    Descripción: item.descripcion,
    Categoría: item.categoria,
    Subcategoría: item.subcategoria,
    Marca: item.marca,
    Lote: item.lote,
    Vencimiento: item.vencimiento,
    "Cantidad Inicial": item.cantidad_inicial,
    "Cantidad Escaneada": item.cantidad_scanner || 0,
    "Cantidad Actual": item.cantidad_actual,
    Diferencia: item.diferencia,
    Tipo: item.tipo_diferencia,
    "Precio Compra": item.precio_compra,
    "Precio Venta": item.precio_venta,
    "Valor Diferencia": item.valor_diferencia,
  }));

  // Crear la hoja de items
  const wsItems = XLSX.utils.json_to_sheet(itemsData);

  // Preparar los datos para la hoja de resumen
  const resumenData = [
    ["Resumen del Inventario", ""],
    ["Total de Items", reporte.resumen.total_items],
    ["Items con Ganancia", reporte.resumen.total_ganancias],
    ["Items con Pérdida", reporte.resumen.total_perdidas],
    ["Valor Total Ganancias", reporte.resumen.valor_ganancias_formato],
    ["Valor Total Pérdidas", reporte.resumen.valor_perdidas_formato],
    ["Valor Neto", reporte.resumen.valor_diferencia_neto_formato],
  ];

  // Crear la hoja de resumen
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);

  // Ajustar el ancho de las columnas para la hoja de items
  const itemsColWidth = [
    { wch: 15 }, // Código
    { wch: 15 }, // Código de Barras
    { wch: 40 }, // Descripción
    { wch: 20 }, // Categoría
    { wch: 20 }, // Subcategoría
    { wch: 15 }, // Marca
    { wch: 15 }, // Lote
    { wch: 12 }, // Vencimiento
    { wch: 12 }, // Cantidad Inicial
    { wch: 12 }, // Cantidad Escaneada
    { wch: 12 }, // Cantidad Actual
    { wch: 12 }, // Diferencia
    { wch: 10 }, // Tipo
    { wch: 15 }, // Precio Compra
    { wch: 15 }, // Precio Venta
    { wch: 15 }, // Valor Diferencia
  ];

  wsItems["!cols"] = itemsColWidth;

  // Ajustar el ancho de las columnas para la hoja de resumen
  wsResumen["!cols"] = [
    { wch: 20 }, // Títulos
    { wch: 15 }, // Valores
  ];

  // Agregar las hojas al libro
  XLSX.utils.book_append_sheet(wb, wsItems, "Detalle de Items");
  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

  // Generar el archivo
  const fileName = `Reporte_Inventario_${
    new Date().toISOString().split("T")[0]
  }.xlsx`;
  XLSX.writeFile(wb, fileName);
};
