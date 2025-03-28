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
}

export interface IngresoDetalle {
  detalle_compra: number;
  articulo_id: number;
  articulo_descripcion: string;
  cantidad: number;
  lote: string;
  vencimiento: string;
}

export interface FiltrosDTO {
  tipo_ingreso: number;
  deposito: number;
  sucursal: number;
  nro_proveedor: number;
  fecha_desde: string;
  fecha_hasta: string;
  nro_factura: string;
}
