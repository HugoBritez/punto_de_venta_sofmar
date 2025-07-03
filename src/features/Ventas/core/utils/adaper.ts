import { Articulo } from '@/ui/articulos/types/articulo.type';
import { ArticuloBusqueda } from '@/shared/types/articulos';

/**
 * Adapta un Articulo a ArticuloBusqueda
 * Convierte la interfaz de snake_case a camelCase
 */
export const adaptarArticuloABusqueda = (articulo: Articulo): ArticuloBusqueda => {
  return {
    idLote: articulo.id_lote,
    lote: articulo.lote,
    idArticulo: articulo.id_articulo,
    codigoBarra: articulo.codigo_barra,
    descripcion: articulo.descripcion,
    stockNegativo: articulo.stock_negativo,
    precioCosto: articulo.precio_costo,
    precioVentaGuaranies: articulo.precio_venta_guaranies,
    precioCredito: articulo.precio_credito,
    precioMostrador: articulo.precio_mostrador,
    precio4: articulo.precio_4,
    precioCostoDolar: articulo.precio_costo_dolar,
    precioVentaDolar: articulo.precio_venta_dolar,
    precioCostoPesos: articulo.precio_costo_pesos,
    precioVentaPesos: articulo.precio_venta_pesos,
    precioCostoReal: articulo.precio_costo_real,
    precioVentaReal: articulo.precio_venta_real,
    vencimientoLote: articulo.vencimiento_lote,
    cantidadLote: articulo.cantidad_lote,
    deposito: articulo.deposito,
    ubicacion: articulo.ubicacion,
    subUbicacion: articulo.sub_ubicacion,
    marca: articulo.marca,
    subcategoria: articulo.subcategoria,
    categoria: articulo.categoria,
    iva: articulo.iva,
    vencimientoValidacion: articulo.vencimiento_validacion,
    ivaDescripcion: articulo.iva_descripcion,
    editarNombre: articulo.editar_nombre,
    estadoVencimiento: articulo.estado_vencimiento,
    proveedor: articulo.proveedor,
    fechaUltimaVenta: articulo.fecha_ultima_venta,
    fechaUltimaCompra: articulo.fecha_ultima_compra,
    preCompra: articulo.precompra,
    principio_activo: articulo.principio_activo,
    cantidad_caja: articulo.cantidad_caja,
    precio_sugerido: articulo.precio_sugerido,
    presentacion: articulo.presentacion,
    precompra: articulo.precompra,
  };
};

/**
 * Adapta un ArticuloBusqueda a Articulo
 * Convierte la interfaz de camelCase a snake_case
 */
export const adaptarBusquedaAArticulo = (articuloBusqueda: ArticuloBusqueda): Articulo => {
  return {
    id_lote: articuloBusqueda.idLote,
    lote: articuloBusqueda.lote,
    id_articulo: articuloBusqueda.idArticulo,
    codigo_barra: articuloBusqueda.codigoBarra,
    descripcion: articuloBusqueda.descripcion,
    stock_negativo: articuloBusqueda.stockNegativo,
    precio_costo: articuloBusqueda.precioCosto,
    precio_venta_guaranies: articuloBusqueda.precioVentaGuaranies,
    precio_credito: articuloBusqueda.precioCredito,
    precio_mostrador: articuloBusqueda.precioMostrador,
    precio_4: articuloBusqueda.precio4,
    precio_costo_dolar: articuloBusqueda.precioCostoDolar,
    precio_venta_dolar: articuloBusqueda.precioVentaDolar,
    precio_costo_pesos: articuloBusqueda.precioCostoPesos,
    precio_venta_pesos: articuloBusqueda.precioVentaPesos,
    precio_costo_real: articuloBusqueda.precioCostoReal,
    precio_venta_real: articuloBusqueda.precioVentaReal,
    vencimiento_lote: articuloBusqueda.vencimientoLote,
    cantidad_lote: articuloBusqueda.cantidadLote,
    deposito: articuloBusqueda.deposito,
    ubicacion: articuloBusqueda.ubicacion,
    sub_ubicacion: articuloBusqueda.subUbicacion,
    marca: articuloBusqueda.marca,
    subcategoria: articuloBusqueda.subcategoria,
    categoria: articuloBusqueda.categoria,
    iva: articuloBusqueda.iva,
    vencimiento_validacion: articuloBusqueda.vencimientoValidacion,
    iva_descripcion: articuloBusqueda.ivaDescripcion,
    editar_nombre: articuloBusqueda.editarNombre,
    estado_vencimiento: articuloBusqueda.estadoVencimiento,
    proveedor: articuloBusqueda.proveedor,
    fecha_ultima_venta: articuloBusqueda.fechaUltimaVenta,
    fecha_ultima_compra: articuloBusqueda.fechaUltimaCompra,
    precompra: articuloBusqueda.preCompra,
    principio_activo: articuloBusqueda.principio_activo || '',
    cantidad_caja: articuloBusqueda.cantidad_caja || 0,
    precio_sugerido: articuloBusqueda.precio_sugerido || 0,
    presentacion: articuloBusqueda.presentacion || '',
    cantidad: undefined, // Campo específico de Articulo que no existe en ArticuloBusqueda
    al_codigo: 0, // Campo específico de Articulo que no existe en ArticuloBusqueda
    al_vencimiento: '', // Campo específico de Articulo que no existe en ArticuloBusqueda
    ar_editar_desc: 0, // Campo específico de Articulo que no existe en ArticuloBusqueda
  };
};
