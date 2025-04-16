export interface PedidoFaltante {
    id_detalle: number;
    id_pedido: number;
    fecha: string;
    cliente: string;
    cod_barra: string;
    descripcion: string;
    marca: string;
    cantidad_faltante: number;
    cantidad_faltante_num: number;
    operador: string;
    vendedor: string;
    cantidad_pedido: number;
    cantidad_pedido_num: number;
    id_lote: number;
    deposito: string;
    observacion: string;
    subtotal: number;
    subtotal_num: number;
    p_unitario: number;
    p_unitario_num: number;
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

export interface RehacerPedidoDTO {
    id_pedido: number;
    detalle : {
        detalle_id: number;
        lote_id: number;
    }[]
}

