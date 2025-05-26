export interface PedidoDetalleViewModel {
    codigo: number;
    descripcion_articulo: string;
    cantidad_vendida: number;
    bonificacion: string;
    d_cantidad: number;
    precio: string;
    ultimo_precio: string;
    porc_costo: number;
    porcentaje: number;
    descuento: string;
    exentas: string;
    cinco: string;
    diez: string;
    dp_lote: string;
    vencimiento: string;
    comision: number;
    actorizado: boolean;
    obs: string;
    cant_stock: number;
    dp_codigolote: number;
    cant_pendiente: number;
    cantidad_verificada: number;
}

export interface PedidoViewModel {
    pedido_id: number;
    cliente: string;
    moneda: string;
    fecha: Date;
    factura: string;
    area: string;
    siguiente_area: string;
    estado: string;
    estado_num: number;
    condicion: string;
    operador: string;
    vendedor: string;
    deposito: string;
    p_cantcuotas: number;
    p_entrega: number;
    p_autorizar_a_contado: boolean;
    imprimir: boolean;
    imprimir_preparacion: boolean;
    cliente_id: number;
    cantidad_cajas: number;
    obs: string;
    total: string;
    acuerdo: string;
    detalles: PedidoDetalleViewModel[];
}