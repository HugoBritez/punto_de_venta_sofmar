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
    tiene_lotes_disponibles: string;
    lotes_disponibles: {
        id_lote: number;
        lote: string;
        vencimiento: string;
        cantidad: number;
        deposito: string;
        id_deposito: number;
    }[]
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

