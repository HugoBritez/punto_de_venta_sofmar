export interface GetPresupuestosParams {
    fecha_desde?: string;
    fecha_hasta?: string;
    sucursal?: number;
    cliente?: number;
    vendedor?: number;
    articulo?: number;
    moneda?: number;
    estado?: number;
    busqueda?: string; 
}