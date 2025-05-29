import { Sucursal, Deposito } from "@/shared/types/shared_interfaces";
import { ListaPrecio } from "@/models/viewmodels/ListaPrecioViewModel";
import { UsuarioViewModel } from "@/models/viewmodels/usuarioViewModel";
import { ArticuloBusqueda } from "@/models/viewmodels/articuloBusqueda";
import { DetalleVenta } from "@/models/dtos/Ventas/DetalleVenta";
import { Moneda } from "@/models/viewmodels/MonedaViewModel";


interface ParamsAgregarItem {
    articulo: ArticuloBusqueda;
    cantidad: number;
    precioSeleccionado: ListaPrecio;
    depositoSeleccionado: Deposito;
    sucursalSeleccionada: Sucursal;
    vendedorSeleccionado: UsuarioViewModel;
    monedaSeleccionada?: Moneda;
    precioUnitario?: number;
    descuento?: number;
    bonificacion?: number;
}

interface ResultadoAgregarItem {
    ok: boolean;
    error?: string;
    detalleVenta?: DetalleVenta[];
}

export function agregarItemVenta(
    detalleVenta: DetalleVenta[],
    params: ParamsAgregarItem
): ResultadoAgregarItem {
    const {
        articulo,
        cantidad,
        precioSeleccionado,
        depositoSeleccionado,
        sucursalSeleccionada,
        vendedorSeleccionado,
        monedaSeleccionada,
        precioUnitario,
        descuento,
        bonificacion,
    } = params;
    if (!vendedorSeleccionado?.op_codigo) {
        return { ok: false, error: "Debe seleccionar un vendedor" };
    }
    if (!precioSeleccionado?.lpCodigo) {
        return { ok: false, error: "Debe seleccionar un precio" };
    }
    if (!depositoSeleccionado?.dep_codigo) {
        return { ok: false, error: "Debe seleccionar un deposito" };
    }
    if (!sucursalSeleccionada?.id) {
        return { ok: false, error: "Debe seleccionar una sucursal" };
    }
    if (articulo.stockNegativo === 0 && cantidad > articulo.cantidadLote) {
        return { ok: false, error: "No hay stock disponible para este articulo" };
    }
    let precioAUsar;

    if (precioUnitario) {
        precioAUsar = precioUnitario;
    } else if (monedaSeleccionada && monedaSeleccionada.moCodigo != 1) {
        switch (monedaSeleccionada.moCodigo) {
            case 2: precioAUsar = articulo.precioVentaDolar;
                break;
            case 3: precioAUsar = articulo.precioCostoReal;
                break;
            case 4: precioAUsar = articulo.precioCostoPesos;
                break;
            default: precioAUsar = articulo.precioVentaGuaranies
        }
    } else {
        switch (precioSeleccionado.lpCodigo) {
            case 1:
                precioAUsar = articulo.precioVentaGuaranies;
                break;
            case 2:
                precioAUsar = articulo.precioCredito;
                break;
            case 3:
                precioAUsar = articulo.precioMostrador;
                break;
            default:
                precioAUsar = articulo.precioVentaGuaranies;
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

    const nuevoItem: DetalleVenta = {
        deveVenta: 0,
        deveArticulo: articulo.idArticulo,
        deveCantidad: cantidad,
        devePrecio: precioAUsar,
        deveDescuento: descuento || 0,
        deveExentas: exentas || 0,
        deveCinco: cinco || 0,
        deveDiez: diez || 0,
        deveDevolucion: 0,
        deveVendedor: vendedorSeleccionado.op_codigo,
        deveColor: "",
        deveBonificacion: bonificacion || 0,
        deveTalle: "",
        deveCodioot: 0,
        deveCosto: articulo.precioCosto,
        deveCostoArt: articulo.precioCosto,
        deveCincoX: cinco_x || 0,
        deveDiezX: diez_x || 0,
        codigoBarra: articulo.codigoBarra,
        descripcion: articulo.descripcion,
        precioUnitario: precioAUsar,
        subtotal: precioAUsar * cantidad - (descuento || 0),
        lote: articulo.lote,
        loteId: articulo.idLote,
        articuloEditado: false,
        deveDescripcionEditada: '',
    }
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
    newItems[item].deveDiez = newItems[item].deveDiez * cantidad;
    newItems[item].deveCinco = newItems[item].deveCantidad * cantidad;
    newItems[item].deveExentas = newItems[item].deveExentas * cantidad;
    // Recalcular los impuestos como porcentajes del valor base
    newItems[item].deveCincoX = newItems[item].deveCinco > 0 ? Number(newItems[item].deveCinco / 21) : 0;
    newItems[item].deveDiezX = newItems[item].deveDiez > 0 ? Number(newItems[item].deveDiez / 11) : 0;
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
    // Recalcular los valores base de impuestos
    newItems[item].deveExentas = newItems[item].deveExentas > 0 ? newItems[item].subtotal : 0;
    newItems[item].deveCinco = newItems[item].deveCinco > 0 ? newItems[item].subtotal : 0;
    newItems[item].deveDiez = newItems[item].deveDiez > 0 ? newItems[item].subtotal : 0;
    // Recalcular los impuestos como porcentajes del valor base
    newItems[item].deveCincoX = newItems[item].deveCinco > 0 ? Number(newItems[item].deveCinco / 21) : 0;
    newItems[item].deveDiezX = newItems[item].deveDiez > 0 ? Number(newItems[item].deveDiez / 11) : 0;
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
    // Recalcular los valores base de impuestos
    newItems[item].deveExentas = newItems[item].deveExentas > 0 ? newItems[item].subtotal : 0;
    newItems[item].deveCinco = newItems[item].deveCinco > 0 ? newItems[item].subtotal : 0;
    newItems[item].deveDiez = newItems[item].deveDiez > 0 ? newItems[item].subtotal : 0;
    // Recalcular los impuestos como porcentajes del valor base
    newItems[item].deveCincoX = newItems[item].deveCinco > 0 ? Number(newItems[item].deveCinco / 21) : 0;
    newItems[item].deveDiez = newItems[item].deveDiez > 0 ? Number(newItems[item].deveDiez / 11) : 0;
    return { ok: true, detalleVenta: newItems };
}

export function actualizarBonificacionItemVenta(
    detalleVenta: DetalleVenta[],
    item: number,
    bonificacion: number
): ResultadoAgregarItem {
    const newItems = [...detalleVenta];
    newItems[item].deveBonificacion = bonificacion;
    // Si hay bonificación, los impuestos se ponen en 0
    if (bonificacion === 1) {
        newItems[item].deveExentas = 0;
        newItems[item].deveCinco = 0;
        newItems[item].deveDiez = 0;
        newItems[item].deveCincoX = 0;
        newItems[item].deveDiezX = 0;
    }
    return { ok: true, detalleVenta: newItems };
}

export function actualizarDescripcionItemVenta(
    detalleVenta: DetalleVenta[],
    item: number,
    descripcion: string
): ResultadoAgregarItem {
    const newItems = [...detalleVenta];
    newItems[item].descripcion = descripcion;
    newItems[item].articuloEditado = true;
    newItems[item].deveDescripcionEditada = descripcion;
    return { ok: true, detalleVenta: newItems };
}