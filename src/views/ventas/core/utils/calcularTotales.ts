import { DetalleVenta } from "@/models/dtos/Ventas/DetalleVenta";
import { CotizacionViewModel } from "@/models/viewmodels/CotizacionViewModel";


export interface TotalesVenta {
    total: number;
    totalDescuentos: number;
    totalAPagar: number;
    totalExentas: number;
    totalCinco: number;
    totalDiez: number;
    totalDolares: number;
    totalReales: number;
    totalPesos: number;
}

export function calcularTotales (
    detalleVenta: DetalleVenta[],
    cotizaciones?: CotizacionViewModel[]
): TotalesVenta {
    let total = 0;
    let totalDescuentos = 0;
    let totalExentas = 0;
    let totalCinco = 0;
    let totalDiez = 0;
    let totalDolares = 0;
    let totalReales = 0;
    let totalPesos = 0;


    for (const item of detalleVenta) {
        total += item.devePrecio * item.deveCantidad;
        totalDescuentos += item.deveDescuento || 0;
        totalExentas += (item.deveExentas || 0) * item.deveCantidad;
        totalCinco += (item.deveCinco || 0) * item.deveCantidad;
        totalDiez += (item.deveDiez || 0) * item.deveCantidad;

        if(cotizaciones)
        {
            const cotizacionDolar = cotizaciones.find(cot=> cot.coMoneda === 2)?.coMonto || 0
            const cotizacionReal = cotizaciones.find(cot=> cot.coMoneda === 3)?.coMonto || 0
            const cotizacionPeso = cotizaciones.find(cot=> cot.coMoneda === 4)?.coMonto || 0
            totalDolares += (item.precioUnitario || 0 * item.deveCantidad) * cotizacionDolar
            totalReales += (item.precioUnitario || 0 * item.deveCantidad) * cotizacionReal
            totalPesos += (item.precioUnitario || 0 * item.deveCantidad) * cotizacionPeso
        }
    }

    const totalAPagar = total - totalDescuentos;

    return {
        total,
        totalDescuentos,
        totalAPagar,
        totalExentas,
        totalCinco,
        totalDiez,
        totalDolares,
        totalReales,
        totalPesos
    };
}