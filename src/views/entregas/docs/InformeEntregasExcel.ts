import * as XLSX from "xlsx";

interface ResumenEntregas {
  camion: string;
  chofer: string;
  codigo_ruteo: number;
  detalles: {
    cliente: string;
    estado: number;
    hora_entrada: string;
    hora_salida: string;
    diferencia_horas: string;
    id: number;
    monto: number;
    nro_factura: string;
    observacion: string;
    tipo_reparto: string;
  }[];
  estado_ruteo: string;
  fecha_ruteo: string;
  hora_llegada_ruteo: string;
  hora_salida_ruteo: string;
  km_actual: string;
  km_ultimo: string;
  moneda: string;
  sucursal: string;
  total_cobros: number;
  total_pagos: number;
  total_pedidos: number;
  total_ventas: number;
  total_monto: number;
  total_monto_num: number;
  tiempo_total: string;
}

interface GenerarExcelProps {
  resumenEntregas: ResumenEntregas[];
  fechaCompletaActual: string;
}

export const InformeEntregasExcel = ({
  resumenEntregas,
  fechaCompletaActual,
}: GenerarExcelProps) => {
  // Crear el libro de trabajo
  const wb = XLSX.utils.book_new();

  // Hoja 1: Resumen general
  const resumenGeneral = resumenEntregas.map((entrega) => ({
    "Código Ruteo": entrega.codigo_ruteo,
    Fecha: entrega.fecha_ruteo,
    Sucursal: entrega.sucursal,
    Chofer: entrega.chofer,
    Camión: entrega.camion,
    Estado: entrega.estado_ruteo,
    "Hora Salida": entrega.hora_salida_ruteo,
    "Hora Llegada": entrega.hora_llegada_ruteo,
    "KM Salida": entrega.km_actual,
    "KM Llegada": entrega.km_ultimo,
    "Total Pedidos": entrega.total_pedidos,
    "Total Monto": Number(entrega.total_monto_num),
    "Tiempo Total": entrega.tiempo_total,
  }));

  // Hoja 2: Detalles de entregas
  const detallesEntregas = resumenEntregas.flatMap((entrega) =>
    entrega.detalles.map((detalle) => ({
      "Código Ruteo": entrega.codigo_ruteo,
      Sucursal: entrega.sucursal,
      Cliente: detalle.cliente,
      "Nro Factura": detalle.nro_factura,
      "Tipo Reparto": detalle.tipo_reparto,
      Monto: Number(detalle.monto),
      "Hora Entrada": detalle.hora_entrada,
      "Hora Salida": detalle.hora_salida,
      Tiempo: detalle.diferencia_horas,
      Observación: detalle.observacion,
    }))
  );

  //anchos de columna
  const wscols = [
    { wch: 10 }, // Código
    { wch: 15 }, // Fecha
    { wch: 20 }, // Sucursal
    { wch: 20 }, // Chofer/Cliente
    { wch: 15 }, // Camión/Nro Factura
    { wch: 15 }, // Estado/Tipo
    { wch: 15 }, // Hora
    { wch: 15 }, // Hora
    { wch: 12 }, // KM/Monto
    { wch: 30 }, // Observación
  ];

  // Crear y agregar las hojas
  const wsResumen = XLSX.utils.json_to_sheet(resumenGeneral);
  const wsDetalles = XLSX.utils.json_to_sheet(detallesEntregas);

  wsResumen["!cols"] = wscols;
  wsDetalles["!cols"] = wscols;

  XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen General");
  XLSX.utils.book_append_sheet(wb, wsDetalles, "Detalles");

  // Guardar el archivo
  XLSX.writeFile(wb, `informe_entregas_${fechaCompletaActual}.xlsx`);
};
