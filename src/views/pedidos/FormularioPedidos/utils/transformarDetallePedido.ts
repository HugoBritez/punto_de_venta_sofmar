import { DetallePedidoDTO } from "../types/shared.type";

import { DetallePedidoTabla } from "../types/shared.type";

export const transformarDetallePedido = (
  detallePedidoTabla: DetallePedidoTabla
): DetallePedidoDTO => {
  return {
    dp_pedido: detallePedidoTabla.dp_pedido,
    dp_articulo: detallePedidoTabla.dp_articulo,
    dp_cantidad: detallePedidoTabla.dp_cantidad,
    dp_precio: detallePedidoTabla.dp_precio,
    dp_descuento: detallePedidoTabla.dp_descuento,
    dp_exentas: detallePedidoTabla.dp_exentas,
    dp_cinco: detallePedidoTabla.dp_cinco,
    dp_diez: detallePedidoTabla.dp_diez,
    dp_lote: detallePedidoTabla.dp_lote,
    dp_vence: detallePedidoTabla.dp_vence,
    dp_vendedor: detallePedidoTabla.dp_vendedor,
    dp_codigolote: detallePedidoTabla.dp_codigolote,
    dp_facturado: detallePedidoTabla.dp_facturado,  
    dp_porcomision: detallePedidoTabla.dp_porcomision,
    dp_actorizado: detallePedidoTabla.dp_actorizado,
    dp_habilitar: detallePedidoTabla.dp_habilitar,
    dp_bonif: detallePedidoTabla.dp_bonif,
    dp_descripcion_art: detallePedidoTabla.dp_descripcion_art,
    dp_obs: detallePedidoTabla.dp_obs,
    cantidad_cargada: detallePedidoTabla.cantidad_cargada,
  };
};