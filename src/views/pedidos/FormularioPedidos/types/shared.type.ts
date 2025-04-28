export interface PedidoDTO {
 p_fecha: string;
 p_nro_pedido: string;
 p_cliente: number;
 p_operador: number;
 p_moneda: number;
 p_deposito: number;
 p_sucursal: number;
 p_descuento: number;
 p_obs: string;
 p_estado: number;
 p_vendedor: number;
 p_area: number;
 p_tipo_estado: number;
 p_credito: number;
 p_imprimir: number;
 p_interno: number;
 p_latitud: number;
 p_longitud: number;
 p_tipo: number;
 p_entrega: number;
 p_cantcuotas: number;
 p_consignacion: number;
 p_autorizar_a_contado: number;
 p_zona: number;
 p_acuerdo: number;
 p_imprimir_preparacion: number;
 p_cantidad_cajas: number;
 p_preparado_por: number;
 p_verificado_por: number;
}

export interface DetallePedidoDTO {
 dp_pedido: number;
 dp_articulo: number;
 dp_cantidad: number;
 dp_precio: number;
 dp_descuento: number;
 dp_exentas: number;
 dp_cinco: number;
 dp_diez: number;
 dp_lote: string;
 dp_vence: string;
 dp_vendedor: number;
 dp_codigolote: number;
 dp_facturado: number;
 dp_porcomision: number;
 dp_actorizado: number;
 dp_habilitar: number;
 dp_bonif: number;
 dp_descripcion_art: string;
 dp_obs: string;
 cantidad_cargada: number;
}

export interface DetallePedidoTabla extends DetallePedidoDTO {
  codigo: string;
  descripcion: string;
  precioUnitario: number;
  subtotal: number;
}

export interface DetalleFaltanteDTO {
    d_detalle_pedido: number;
    d_cantidad: number;
    d_situacion: number;
} 

export interface Pedido {
  pedido_id: number;
  cliente: string;
  moneda: string;
  fecha: string;
  factura: string;
  area: string;
  siguiente_area: string;
  estado: string;
  condicion: string;
  operador: string;
  vendedor: string;
  p_cantcuotas: number;
  p_entrega: number;
  p_autorizar_a_contado: number;
  imprimir: number;
  imprimir_preparacion: number;
  cliente_id: number;
  cantidad_cajas: number;
  obs: string;
  total: number;
  detalles: DetallePedido[];
  faltante: number;
}

export interface DetallePedido {
    codigo: number;
    descripcion_articulo: string;
    cantidad_vendida: number;
    bonificacion: number;
    d_cantidad: number;
    precio: number;
    ultimo_precio: number;
    porc_costo: number;
    porcentaje: number;
    descuento: number;
    exentas: number;
    cinco: number;
    diez: number;
    dp_lote: string;
    vencimiento: string;
    comision: number;
    actorizado: number;
    obs: string;
    cant_stock: number;
    dp_codigolote: string;
    cant_pendiente: number;
    cantidad_verificada: number;
    cantidad_faltante: number;
}