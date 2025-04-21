export interface BusquedaDTO {
  busqueda: string;
  id_articulo?: string | null;
  codigo_barra?: string | null;
  sucursal?: number;
  deposito?: number;
  stock?: boolean;
  moneda?: number;
  marca?: number;
  categoria?: number;
  ubicacion?: number;
  proveedor?: number;
  cod_interno?: number;
  articulo?: number;
}