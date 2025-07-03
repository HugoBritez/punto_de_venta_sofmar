import { DetalleVenta } from "@/shared/types/venta";

export interface TotalesVenta {
    total: number;
    totalDescuentos: number;
    totalAPagar: number;
    totalExentas: number;
    totalCinco: number;
    totalDiez: number;
    totalDevuelto: number;
}

export function calcularTotales (
    detalleVenta: DetalleVenta[],
    montoEntregado: number
): TotalesVenta {
    let total = 0;
    let totalDescuentos = 0;
    let totalExentas = 0;
    let totalCinco = 0;
    let totalDiez = 0;
    let totalDevuelto = 0;

    for (const item of detalleVenta) {
        total += item.devePrecio * item.deveCantidad;
        totalDescuentos += item.deveDescuento || 0;
        totalExentas += (item.deveExentas || 0) * item.deveCantidad;
        totalCinco += (item.deveCinco || 0) * item.deveCantidad;
        totalDiez += (item.deveDiez || 0) * item.deveCantidad;
    }

    const totalAPagar = total - totalDescuentos;
    totalDevuelto = montoEntregado - totalAPagar;

    return {
        total,
        totalDescuentos,
        totalAPagar,
        totalExentas,
        totalCinco,
        totalDiez,
        totalDevuelto
    };
}