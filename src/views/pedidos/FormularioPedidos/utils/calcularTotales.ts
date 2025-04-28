import { DetallePedidoTabla } from "../types/shared.type";

export interface TotalesPedido {
  total: number;
  totalDescuentos: number;
  totalAPagar: number;
  totalExentas: number;
  totalCinco: number;
  totalDiez: number;
}

export function calcularTotalesPedido(
  detallePedido: DetallePedidoTabla[]
): TotalesPedido {
  let total = 0;
  let totalDescuentos = 0;
  let totalExentas = 0;
  let totalCinco = 0;
  let totalDiez = 0;

  for (const item of detallePedido) {
    total += item.dp_precio * item.dp_cantidad;
    totalDescuentos += item.dp_descuento || 0;
    totalExentas += (item.dp_exentas || 0) * item.dp_cantidad;
    totalCinco += (item.dp_cinco || 0) * item.dp_cantidad;
    totalDiez += (item.dp_diez || 0) * item.dp_cantidad;
  }

  const totalAPagar = total - totalDescuentos;

  return {
    total,
    totalDescuentos,
    totalAPagar,
    totalExentas,
    totalCinco,
    totalDiez,
  };
}
