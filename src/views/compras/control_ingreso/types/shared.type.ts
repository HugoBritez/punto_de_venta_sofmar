export interface Ingreso {
  id_compra: number;
  fecha_compra: string;
  deposito: number;
  deposito_descripcion: string;
  sucursal: number;
  sucursal_descripcion: string;
  nro_factura: string;
  id_orden: number;
  proveedor: string;
  proveedor_id: number;
  estado: string;
  verificado: number;
  responsable_ubicacion: string;
  responsable_verificacion: string;
  responsable_confirmacion: string;
}

export interface IngresoDetalle {
  detalle_compra: number;
  articulo_codigo_barras: string;
  articulo_id: number;
  articulo_descripcion: string;
  cantidad: number;
  cantidad_verificada: number;
  lote: string;
  vencimiento: string;
  responsable: string;
}

export interface FiltrosDTO {
  tipo_ingreso: number;
  deposito: number;
  sucursal: number;
  nro_proveedor: number;
  fecha_desde: string;
  fecha_hasta: string;
  nro_factura: string;
  verificado: number;
}

export interface VerificacionCompraDTO {
  id_compra: number;
}

export interface VerificacionItemDTO {
  id_detalle: number;
  cantidad: number;
}

export interface ConfirmarVerificacionDTO {
  id_compra: number;
  deposito_transitorio: number;
  deposito_destino: number;
  factura_compra: string;
  user_id: number;
  operador_id: number;
  items: {
    lote: string;
    cantidad_ingreso: number;
    cantidad_factura: number;
    id_articulo: number;
  }[];
}

export interface ReporteIngresos {
  id_compra: number;
  fecha_compra: string;
  deposito: number;
  deposito_descripcion: string;
  nro_factura: string;
  id_orden: number;
  nro_proveedor: number;
  proveedor: string;
  verificado: number;
  responsable_ubicacion: string;
  responsable_verificacion: string;
  responsable_confirmacion: string;
  estado: string;
  items: {
    detalle_compra: number;
    articulo_id: number;
    articulo_descripcion: string;
    articulo_codigo_barras: string;
    cantidad: number;
    cantidad_verificada: number;
    lote: string;
    vencimiento: string;
  }[];
}
