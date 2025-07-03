import { DetalleVentaTabla, DetalleVentaDTO } from "../../types/sharedDTO.type";

export const transformarDetalleVenta = (
    detalleVentaTabla: DetalleVentaTabla
): DetalleVentaDTO => {
    return {
        deve_venta: detalleVentaTabla.deve_venta,
        deve_articulo: detalleVentaTabla.deve_articulo,
        deve_cantidad: detalleVentaTabla.deve_cantidad,
        deve_precio: detalleVentaTabla.deve_precio,
        deve_descuento: detalleVentaTabla.deve_descuento,
        deve_exentas: detalleVentaTabla.deve_exentas,
        deve_cinco: detalleVentaTabla.deve_cinco,
        deve_diez: detalleVentaTabla.deve_diez,
        deve_devolucion: detalleVentaTabla.deve_devolucion,
        deve_vendedor: detalleVentaTabla.deve_vendedor,
        deve_color: detalleVentaTabla.deve_color,
        deve_bonificacion: detalleVentaTabla.deve_bonificacion,
        deve_talle: detalleVentaTabla.deve_talle,
        deve_codioot: detalleVentaTabla.deve_codioot,
        deve_costo: detalleVentaTabla.deve_costo,
        deve_costo_art: detalleVentaTabla.deve_costo_art,
        deve_cinco_x: detalleVentaTabla.deve_cinco_x,
        deve_diez_x: detalleVentaTabla.deve_diez_x,
        deve_editar_nombre: detalleVentaTabla.deve_editar_nombre,
        deve_lote: detalleVentaTabla.deve_lote,
        deve_lote_id: detalleVentaTabla.deve_lote_id,
    };
}