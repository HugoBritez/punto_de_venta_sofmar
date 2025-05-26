export interface GetPedidosParams {
    fechaDesde: string;
    fechaHasta: string;
    nroPedido?: string;
    articulo?: number;
    clientes?: number[];
    vendedores?: number[];
    sucursales?: number[];
    estado?: string;
    moneda?: number;
    factura?: string;
}