import { Articulo } from "@/shared/ui/articulos/types/articulo.type";
import {  DetalleVentaTabla } from "../../types/sharedDTO.type";
import { ListaPrecios, Sucursal, Deposito } from "@/shared/types/shared_interfaces";
import { Operador } from "@/stores/operadoresStore";


interface ParamsAgregarItem {
    articulo: Articulo;
    cantidad: number;
    precioSeleccionado: ListaPrecios;
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
    detalleVenta?: DetalleVentaTabla[];
}

export function agregarItemVentaRapida(
    detalleVenta: DetalleVentaTabla[],
    params: ParamsAgregarItem
): ResultadoAgregarItem {
    const {
        articulo,
        cantidad,
        precioSeleccionado,
        depositoSeleccionado,
        sucursalSeleccionada,
        vendedorSeleccionado,
        precioUnitario,
        descuento,
        bonificacion,
    } = params;
    if (!vendedorSeleccionado?.op_codigo) {
        return { ok: false, error: "Debe seleccionar un vendedor" };
    }
    if (!precioSeleccionado?.lp_codigo) {
        return { ok: false, error: "Debe seleccionar un precio" };
    }
    if (!depositoSeleccionado?.dep_codigo) {
        return { ok: false, error: "Debe seleccionar un deposito" };
    }
    if (!sucursalSeleccionada?.id) {
        return { ok: false, error: "Debe seleccionar una sucursal" };
    }
    if (articulo.stock_negativo === 0 && cantidad > articulo.cantidad_lote) {
        return { ok: false, error: "No hay stock disponible para este articulo" };
    }
    let precioAUsar;

    if (precioUnitario) {
        precioAUsar = precioUnitario;
    } else {
        switch (precioSeleccionado.lp_codigo) {
            case 1:
                precioAUsar = articulo.precio_venta_guaranies;
                break;
            case 2:
                precioAUsar = articulo.precio_credito;
                break;
            case 3:
                precioAUsar = articulo.precio_mostrador;
                break;
            default:
                precioAUsar = articulo.precio_venta_guaranies;
        }
    }


    let exentas, cinco, diez, cinco_x, diez_x;

    switch (articulo.iva) {
        case 1:
            exentas = precioAUsar;
            cinco = 0;
            diez = 0;
            cinco_x = 0;
            diez_x = 0;
            break;
        case 2:
            exentas = 0;
            cinco = 0;
            diez = precioAUsar;
            cinco_x = 0;
            diez_x = precioAUsar / 11;
            break;
        case 3:
            exentas = 0;
            cinco = precioAUsar;
            diez = 0;
            cinco_x = precioAUsar / 21;
            diez_x = 0;
            break;
        default:
            break;
    }

    const nuevoItem: DetalleVentaTabla = {
        deve_venta: 0,
        deve_articulo: articulo.id_articulo,
        deve_cantidad: cantidad,
        deve_precio: precioAUsar,
        deve_descuento: descuento || 0,
        deve_exentas: exentas || 0,
        deve_cinco: cinco || 0,
        deve_diez: diez || 0,
        deve_devolucion: 0,
        deve_vendedor: vendedorSeleccionado.op_codigo,
        deve_color: "",
        deve_bonificacion: bonificacion || 0,
        deve_talle: "",
        deve_codioot: 0,
        deve_costo: 0,
        deve_costo_art: 0,
        deve_cinco_x: cinco_x || 0,
        deve_diez_x: diez_x || 0,
        cod_barras: articulo.codigo_barra,
        descripcion: articulo.descripcion,
        precioUnitario: precioAUsar,
        subtotal: precioAUsar * cantidad - (descuento || 0),
        lote: articulo.lote,
        lote_id: articulo.id_lote,
        articulo_editado: false,
        deve_descripcion_editada: '',
    }

    return { ok: true, detalleVenta: [...detalleVenta, nuevoItem] };
}


export function eliminarItemVenta (
    detalleVenta: DetalleVentaTabla[],
    item: number
): ResultadoAgregarItem {
    const newItems = detalleVenta.filter((_, i) => i !== item);
    return { ok: true, detalleVenta: newItems };
}


export function actualizarCantidadItemVenta (
    detalleVenta: DetalleVentaTabla[],
    item: number,
    cantidad: number
): ResultadoAgregarItem {
    const newItems = [...detalleVenta];
    newItems[item].deve_cantidad = cantidad;
    newItems[item].subtotal = newItems[item].deve_precio * cantidad - (newItems[item].deve_descuento || 0);
    newItems[item].deve_diez = newItems[item].deve_diez * cantidad;
    newItems[item].deve_cinco = newItems[item].deve_cinco * cantidad;
    newItems[item].deve_exentas = newItems[item].deve_exentas * cantidad;
    // Recalcular los impuestos como porcentajes del valor base
    newItems[item].deve_cinco_x = newItems[item].deve_cinco > 0 ? Number(newItems[item].deve_cinco /21) : 0;
    newItems[item].deve_diez_x = newItems[item].deve_diez > 0 ? Number(newItems[item].deve_diez /11) : 0;
    return { ok: true, detalleVenta: newItems };
}

export function actualizarPrecioUnitarioItemVenta (
    detalleVenta: DetalleVentaTabla[],
    item: number,
    precioUnitario: number
): ResultadoAgregarItem {
    const newItems = [...detalleVenta];
    newItems[item].deve_precio = precioUnitario;
    newItems[item].subtotal = newItems[item].deve_precio * newItems[item].deve_cantidad - (newItems[item].deve_descuento || 0);
    // Recalcular los valores base de impuestos
    newItems[item].deve_exentas = newItems[item].deve_exentas > 0 ? newItems[item].subtotal : 0;
    newItems[item].deve_cinco = newItems[item].deve_cinco > 0 ? newItems[item].subtotal : 0;
    newItems[item].deve_diez = newItems[item].deve_diez > 0 ? newItems[item].subtotal : 0;
    // Recalcular los impuestos como porcentajes del valor base
    newItems[item].deve_cinco_x = newItems[item].deve_cinco > 0 ? Number(newItems[item].deve_cinco /21) : 0;
    newItems[item].deve_diez_x = newItems[item].deve_diez > 0 ? Number(newItems[item].deve_diez /11) : 0;
    return { ok: true, detalleVenta: newItems };
}


export function actualizarDescuentoItemVenta (
    detalleVenta: DetalleVentaTabla[],
    item: number,
    descuento: number
): ResultadoAgregarItem {
    const newItems = [...detalleVenta];
    newItems[item].deve_descuento = descuento;
    newItems[item].subtotal = newItems[item].deve_precio * newItems[item].deve_cantidad - (newItems[item].deve_descuento || 0);
    // Recalcular los valores base de impuestos
    newItems[item].deve_exentas = newItems[item].deve_exentas > 0 ? newItems[item].subtotal : 0;
    newItems[item].deve_cinco = newItems[item].deve_cinco > 0 ? newItems[item].subtotal : 0;
    newItems[item].deve_diez = newItems[item].deve_diez > 0 ? newItems[item].subtotal : 0;
    // Recalcular los impuestos como porcentajes del valor base
    newItems[item].deve_cinco_x = newItems[item].deve_cinco > 0 ? Number(newItems[item].deve_cinco /21) : 0;
    newItems[item].deve_diez_x = newItems[item].deve_diez > 0 ? Number(newItems[item].deve_diez /11) : 0;
    return { ok: true, detalleVenta: newItems };
}


export function actualizarBonificacionItemVenta (
    detalleVenta: DetalleVentaTabla[],
    item: number,
    bonificacion: number
): ResultadoAgregarItem {
    const newItems = [...detalleVenta];
    newItems[item].deve_bonificacion = bonificacion;
    // Si hay bonificación, los impuestos se ponen en 0
    if (bonificacion === 1) {
        newItems[item].deve_exentas = 0;
        newItems[item].deve_cinco = 0;
        newItems[item].deve_diez = 0;
        newItems[item].deve_cinco_x = 0;
        newItems[item].deve_diez_x = 0;
    }
    return { ok: true, detalleVenta: newItems };
}

export function actualizarDescripcionItemVenta (
    detalleVenta: DetalleVentaTabla[],
    item: number,
    descripcion: string
): ResultadoAgregarItem {
    const newItems = [...detalleVenta];
    newItems[item].descripcion = descripcion;
    newItems[item].articulo_editado = true;
    newItems[item].deve_descripcion_editada = descripcion;
    return { ok: true, detalleVenta: newItems };
}




