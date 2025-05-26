export interface GetVentaParams {
    fecha_desde?: string;
    fecha_hasta?: string;
    sucursal?: number;
    cliente?: number;
    vendedor?: number;
    articulo?: number;
    moneda?: number;
    factura?: string;
    venta?: number;
    estadoVenta?: number;
    remisiones?: number;
    listarFacturasSinCDC?: boolean;
    page: number;
    itemsPorPagina: number;
}