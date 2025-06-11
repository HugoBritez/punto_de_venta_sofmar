import { PedidosFacturadosViewModel } from "@/repos/reportesRepository";
import * as XLSX from "xlsx";


export const generarExcelReportePedidosFacturados = (pedidos: PedidosFacturadosViewModel[]) => {
  // Crear el libro de trabajo
  const wb = XLSX.utils.book_new();

  // Preparar los datos para la hoja de pedidos
  const pedidosData = pedidos.map((pedido) => ({
    "Nro. Pedido": pedido.nroPedido,
    "Cliente": pedido.nombreCliente,
    "Fecha": pedido.fechaPedido,
    "Código": pedido.codProducto,
    "Producto": pedido.producto,
    "Marca": pedido.marca,
    "Cant. Pedido": pedido.cantidadPedido,
    "Cant. Facturada": pedido.cantidadFacturada,
    "Cant. Faltante": pedido.cantidadFaltante,
    "Vendedor": pedido.vendedor,
    "Total Pedido": new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG'
    }).format(pedido.totalPedido),
    "Total Venta": new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG'
    }).format(pedido.totalVenta),
    "Diferencia": new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG'
    }).format(pedido.diferenciaTotal),
  }));

  // Crear la hoja de pedidos
  const wsPedidos = XLSX.utils.json_to_sheet(pedidosData);

  // Ajustar el ancho de las columnas
  const pedidosColWidth = [
    { wch: 15 }, // Nro. Pedido
    { wch: 40 }, // Cliente
    { wch: 15 }, // Fecha
    { wch: 15 }, // Código
    { wch: 40 }, // Producto
    { wch: 20 }, // Marca
    { wch: 12 }, // Cant. Pedido
    { wch: 12 }, // Cant. Facturada
    { wch: 12 }, // Cant. Faltante
    { wch: 20 }, // Vendedor
    { wch: 15 }, // Total Pedido
    { wch: 15 }, // Total Venta
    { wch: 15 }, // Diferencia
  ];

  wsPedidos["!cols"] = pedidosColWidth;

  // Agregar la hoja al libro
  XLSX.utils.book_append_sheet(wb, wsPedidos, "Pedidos Facturados");

  // Generar el archivo
  const fileName = `Reporte_Pedidos_Facturados_${
    new Date().toISOString().split("T")[0]
  }.xlsx`;
  XLSX.writeFile(wb, fileName);
};