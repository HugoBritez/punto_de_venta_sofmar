export interface PedidoFaltante {
    id_pedido: number;
    fecha: string;
    cliente: string;
    cod_barra: string;
    descripcion: string;
    marca: string;
    cantidad_faltante: number;
    operador: string;
    vendedor: string;
    cantidad_pedido: number;
    id_lote: number;
    deposito: string;
    observacion: string;
    subtotal: number;
    p_unitario: number;
}

export interface FiltrosPedidoFaltante {
    fecha_desde: string;
    fecha_hasta: string;
    cliente?: number;
    vendedor?: number;
    estado: number;
    articulo?: number;
    dvl?: number;
    marca?: number;
    linea?: number;
    categoria?: number;
    subcategoria?: number;
}