import { Sucursal, Deposito } from "@/types/shared_interfaces";
import { Operador } from "@/stores/operadoresStore";
import { DetalleVenta } from "@/shared/types/venta";
import { ArticuloBusqueda } from "@/shared/types/articulos";
import { ListaPrecio } from "@/shared/types/listaPrecio";
import { Moneda } from "@/shared/types/moneda";

// Constantes para monedas
const MONEDAS = {
    GUARANIES: 1,
    DOLAR: 2,
    PESOS: 3,
    REAL: 4
} as const;

// Constantes para listas de precio
const LISTAS_PRECIO = {
    CONTADO: 1,
    CREDITO: 2,
    MOSTRADOR: 3
} as const;

interface ParamsAgregarItem {
    articulo: ArticuloBusqueda;
    cantidad: number;
    precioSeleccionado: ListaPrecio;
    monedaSeleccionada: Moneda;
    depositoSeleccionado: Deposito;
    sucursalSeleccionada: Sucursal;
    vendedorSeleccionado: Operador;
    precioUnitario?: number;
    descuento?: number;
    bonificacion?: number;
}

interface ResultadoAgregarItem {
    ok: boolean;
    error?: string;
    detalleVenta?: DetalleVenta[];
}

/**
 * Obtiene el precio base según la moneda seleccionada
 */
function obtenerPrecioBase(articulo: ArticuloBusqueda, monedaCodigo: number): number {
    switch (monedaCodigo) {
        case MONEDAS.GUARANIES:
            return articulo.precioVentaGuaranies;
        case MONEDAS.DOLAR:
            return articulo.precioVentaDolar;
        case MONEDAS.PESOS:
            return articulo.precioVentaPesos;
        case MONEDAS.REAL:
            return articulo.precioVentaReal;
        default:
            return articulo.precioVentaGuaranies; // Precio por defecto
    }
}

/**
 * Obtiene el precio según la moneda y lista de precio seleccionada
 * Lógica: 
 * - Para Guaraníes: Se pueden usar diferentes listas de precio
 * - Para otras monedas: Solo se usa el precio base de esa moneda
 */
function obtenerPrecioPorMonedaYLista(
    articulo: ArticuloBusqueda, 
    listaPrecioCodigo: number, 
    monedaCodigo: number
): number {
    // Si es Guaraníes, permitir diferentes listas de precio
    if (monedaCodigo === MONEDAS.GUARANIES) {
        switch (listaPrecioCodigo) {
            case LISTAS_PRECIO.CONTADO:
                return articulo.precioVentaGuaranies;
            case LISTAS_PRECIO.CREDITO:
                return articulo.precioCredito;
            case LISTAS_PRECIO.MOSTRADOR:
                return articulo.precioMostrador;
            default:
                return articulo.precioVentaGuaranies;
        }
    }
    
    // Para otras monedas, usar solo el precio base de esa moneda
    return obtenerPrecioBase(articulo, monedaCodigo);
}

/**
 * Calcula los montos de IVA según el tipo de IVA del artículo
 */
function calcularMontosIVA(precio: number, tipoIVA: number) {
    switch (tipoIVA) {
        case 1: // Exento
            return {
                exentas: precio,
                cinco: 0,
                diez: 0,
                cinco_x: 0,
                diez_x: 0
            };
        case 2: // IVA 10%
            return {
                exentas: 0,
                cinco: 0,
                diez: precio,
                cinco_x: 0,
                diez_x: precio / 11
            };
        case 3: // IVA 5%
            return {
                exentas: 0,
                cinco: precio,
                diez: 0,
                cinco_x: precio / 21,
                diez_x: 0
            };
        default:
            return {
                exentas: 0,
                cinco: 0,
                diez: 0,
                cinco_x: 0,
                diez_x: 0
            };
    }
}

/**
 * Valida los parámetros requeridos para agregar un item
 */
function validarParametros(params: ParamsAgregarItem): string | null {
    if (!params.vendedorSeleccionado?.op_codigo) {
        return "Debe seleccionar un vendedor";
    }
    if (!params.precioSeleccionado?.lpCodigo) {
        return "Debe seleccionar un precio";
    }
    if (!params.depositoSeleccionado?.dep_codigo) {
        return "Debe seleccionar un deposito";
    }
    if (!params.sucursalSeleccionada?.id) {
        return "Debe seleccionar una sucursal";
    }
    if (params.articulo.stockNegativo === 0 && params.cantidad > params.articulo.cantidadLote) {
        return "No hay stock disponible para este articulo";
    }
    return null;
}

export function agregarItemVenta(
    detalleVenta: DetalleVenta[],
    params: ParamsAgregarItem
): ResultadoAgregarItem {
    // Validar parámetros
    const errorValidacion = validarParametros(params);
    if (errorValidacion) {
        return { ok: false, error: errorValidacion };
    }

    const {
        articulo,
        cantidad,
        precioSeleccionado,
        monedaSeleccionada,
        vendedorSeleccionado,
        precioUnitario,
        descuento,
        bonificacion,
    } = params;

    // Determinar precio a usar
    let precioAUsar: number;
    
    if (bonificacion === 1) {
        precioAUsar = 0;
    } else if (precioUnitario) {
        precioAUsar = precioUnitario;
    } else {
        precioAUsar = obtenerPrecioPorMonedaYLista(
            articulo, 
            precioSeleccionado.lpCodigo, 
            monedaSeleccionada.moCodigo
        );
    }

    // Calcular montos de IVA
    const montosIVA = calcularMontosIVA(precioAUsar, articulo.iva);

    const nuevoItem: DetalleVenta = {
        deveVenta: 0,
        deveArticulo: articulo.idArticulo,
        deveCantidad: cantidad,
        devePrecio: precioAUsar,
        deveDescuento: descuento || 0,
        deveExentas: montosIVA.exentas,
        deveCinco: montosIVA.cinco,
        deveDiez: montosIVA.diez,
        deveDevolucion: 0,
        deveVendedor: vendedorSeleccionado.op_codigo,
        deveColor: "",
        deveBonificacion: bonificacion || 0,
        deveTalle: "",
        deveCodioot: 0,
        deveCosto: articulo.precioCosto,
        deveCostoArt: articulo.precioCosto,
        deveCincoX: montosIVA.cinco_x,
        deveDiezX: montosIVA.diez_x,
        codigoBarra: articulo.codigoBarra,
        descripcion: articulo.descripcion,
        precioUnitario: precioAUsar,
        subtotal: precioAUsar * cantidad - (descuento || 0),
        articuloEditado: false,
        editarNombre: 0,
        lote: articulo.lote,
        loteId: articulo.idLote,
        deveDescripcionEditada: '',
    };

    return { ok: true, detalleVenta: [...detalleVenta, nuevoItem] };
}


export function eliminarItemVenta(
    detalleVenta: DetalleVenta[],
    item: number
): ResultadoAgregarItem {
    const newItems = detalleVenta.filter((_, i) => i !== item);
    return { ok: true, detalleVenta: newItems };
}


export function actualizarCantidadItemVenta(
    detalleVenta: DetalleVenta[],
    item: number,
    cantidad: number
): ResultadoAgregarItem {
    const newItems = [...detalleVenta];
    newItems[item].deveCantidad = cantidad;
    newItems[item].subtotal = newItems[item].devePrecio * cantidad - (newItems[item].deveDescuento || 0);
    return { ok: true, detalleVenta: newItems };
}

export function actualizarPrecioUnitarioItemVenta(
    detalleVenta: DetalleVenta[],
    item: number,
    precioUnitario: number
): ResultadoAgregarItem {
    const newItems = [...detalleVenta];
    newItems[item].devePrecio = precioUnitario;
    newItems[item].subtotal = newItems[item].devePrecio * newItems[item].deveCantidad - (newItems[item].deveDescuento || 0);
    return { ok: true, detalleVenta: newItems };
}


export function actualizarDescuentoItemVenta(
    detalleVenta: DetalleVenta[],
    item: number,
    descuento: number
): ResultadoAgregarItem {
    const newItems = [...detalleVenta];
    newItems[item].deveDescuento = descuento;
    newItems[item].subtotal = newItems[item].devePrecio * newItems[item].deveCantidad - (newItems[item].deveDescuento || 0);
    return { ok: true, detalleVenta: newItems };
}


export function actualizarBonificacionItemVenta(
    detalleVenta: DetalleVenta[],
    item: number,
    bonificacion: number
): ResultadoAgregarItem {
    const newItems = [...detalleVenta];
    newItems[item].deveBonificacion = bonificacion;
    return { ok: true, detalleVenta: newItems };
}

export function actualizarDescripcionItemVenta(
    detalleVenta: DetalleVenta[],
    item: number,
    descripcion: string
): ResultadoAgregarItem {
    const newItems = [...detalleVenta];
    newItems[item].descripcion = descripcion;
    return { ok: true, detalleVenta: newItems };
}




