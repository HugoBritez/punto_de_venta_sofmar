import { DetalleVentaTabla } from "../../types/sharedDTO.type";


export interface TotalesVenta {
    total: number;
    totalDescuentos: number;
    totalAPagar: number;
    totalExentas: number;
    totalCinco: number;
    totalDiez: number;
}

export function calcularTotales (
    detalleVenta: DetalleVentaTabla[]
): TotalesVenta {
    let total = 0;
    let totalDescuentos = 0;
    let totalExentas = 0;
    let totalCinco = 0;
    let totalDiez = 0;

    for (const item of detalleVenta) {
        total += item.deve_precio * item.deve_cantidad;
        totalDescuentos += item.deve_descuento || 0;
        totalExentas += (item.deve_exentas || 0) * item.deve_cantidad;
        totalCinco += (item.deve_cinco || 0) * item.deve_cantidad;
        totalDiez += (item.deve_diez || 0) * item.deve_cantidad;
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