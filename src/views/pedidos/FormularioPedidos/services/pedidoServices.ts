// src/services/pedidoService.ts

import { ArticuloBusqueda } from "@/models/viewmodels/articuloBusqueda";
import { DetallePedidoTabla } from "@/views/pedidos/FormularioPedidos/types/shared.type";
import {
  Deposito,
  Sucursal,
} from "@/shared/types/shared_interfaces";
import { Operador } from "@/stores/operadoresStore";
import { Moneda } from "@/models/viewmodels/MonedaViewModel";
import { ListaPrecio } from "@/models/viewmodels/ListaPrecioViewModel";

interface ParamsAgregarItem {
  articulo: ArticuloBusqueda;
  cantidad: number;
  precioSeleccionado: ListaPrecio;
  monedaSeleccionada: Moneda;
  depositoSeleccionado: Deposito;
  sucursalSeleccionada: Sucursal;
  vendedorSeleccionado: Operador;
  precioUnitario?: number;
  descuento?: number;
  bonificacion?: number;
}

interface ResultadoAgregarItem {
  ok: boolean;
  error?: string;
  detallePedido?: DetallePedidoTabla[];
}
export function agregarItemPedido(
  detallePedido: DetallePedidoTabla[],
  params: ParamsAgregarItem
): ResultadoAgregarItem {
  const {
    articulo,
    cantidad,
    precioSeleccionado,
    monedaSeleccionada,
    depositoSeleccionado,
    sucursalSeleccionada,
    vendedorSeleccionado,
    precioUnitario,
    descuento,
    bonificacion,
  } = params;
  if (!vendedorSeleccionado?.op_codigo) {
    return { ok: false, error: "Debe seleccionar un vendedor" };
  }
  if (!precioSeleccionado?.lpCodigo) {
    return { ok: false, error: "Debe seleccionar un precio" };
  }
  if (!monedaSeleccionada?.moCodigo) {
    return { ok: false, error: "Debe seleccionar una moneda" };
  }
  if (!depositoSeleccionado?.dep_codigo) {
    return { ok: false, error: "Debe seleccionar un deposito" };
  }
  if (!sucursalSeleccionada?.id) {
    return { ok: false, error: "Debe seleccionar una sucursal" };
  }
  let precioAUsar;
  if (precioUnitario) {
    precioAUsar = precioUnitario;
  } else {
    if (monedaSeleccionada?.moCodigo === 1) {
      // Guaraníes: puedes elegir entre varios precios
      switch (precioSeleccionado?.lpCodigo) {
        case 1:
          precioAUsar = articulo.precioVentaGuaranies;
          break;
        case 2:
          precioAUsar = articulo.precioCredito;
          break;
        case 3:
          precioAUsar = articulo.precioMostrador;
          break;
        default:
          precioAUsar = articulo.precioVentaGuaranies;
          break;
      }
    } else {
      // Otras monedas: solo puedes usar el precio correspondiente a la moneda
      switch (monedaSeleccionada?.moCodigo) {
        case 2:
          precioAUsar = articulo.precioVentaDolar;
          break;
        case 3:
          precioAUsar = articulo.precioVentaReal;
          break;
        case 4:
          precioAUsar = articulo.precioVentaPesos;
          break;
        default:
          precioAUsar = articulo.precioVentaGuaranies;
          break;
      }
    }
  }

  let exentas, cinco, diez;
  switch (articulo.iva) {
    case 1:
      exentas = precioAUsar;
      cinco = 0;
      diez = 0;
      break;
    case 2:
      exentas = 0;
      cinco = 0;
      diez = precioAUsar;
      break;
    case 3:
      exentas = 0;
      cinco = precioAUsar;
      diez = 0;
      break;
    default:
      break;
  }

  const nuevoItem: DetallePedidoTabla = {
    dp_pedido: 0,
    dp_articulo: articulo.idArticulo,
    dp_cantidad: cantidad,
    dp_precio: precioAUsar,
    dp_descuento: descuento || 0,
    dp_exentas: exentas || 0,
    dp_cinco: cinco || 0,
    dp_diez: diez || 0,
    dp_lote: articulo.lote,
    dp_vence: articulo.vencimientoLote,
    dp_vendedor: vendedorSeleccionado?.op_codigo,
    dp_codigolote: articulo.idLote,
    dp_facturado: 0,
    dp_porcomision: 0,
    dp_actorizado: 0,
    dp_habilitar: 0,
    dp_bonif: bonificacion || 0,
    dp_descripcion_art: "",
    dp_obs: "",
    cantidad_cargada: 0,
    codigo: articulo.codigoBarra,
    descripcion: articulo.descripcion,
    precioUnitario: precioAUsar,
    subtotal: precioAUsar * cantidad - (descuento || 0),
  };

  return { ok: true, detallePedido: [...detallePedido, nuevoItem] };
}

export function eliminarItemPedido(
  detallePedido: DetallePedidoTabla[],
  item: number
): ResultadoAgregarItem {
  const newItems = detallePedido.filter((_, i) => i !== item);
  return { ok: true, detallePedido: newItems };
}

export function actualizarCantidadItemPedido(
  detallePedido: DetallePedidoTabla[],
  item: number,
  cantidad: number
): ResultadoAgregarItem {
  const newItems = [...detallePedido];
  newItems[item].dp_cantidad = cantidad;
  newItems[item].subtotal = newItems[item].dp_precio * cantidad - (newItems[item].dp_descuento || 0);
  return { ok: true, detallePedido: newItems };
}

export function actualizarPrecioUnitarioItemPedido(
  detallePedido: DetallePedidoTabla[],
  item: number,
  precioUnitario: number
): ResultadoAgregarItem {
  const newItems = [...detallePedido];
  newItems[item].dp_precio = precioUnitario;
  newItems[item].subtotal = newItems[item].dp_precio * newItems[item].dp_cantidad - (newItems[item].dp_descuento || 0);
  return { ok: true, detallePedido: newItems };
}

export function actualizarDescuentoItemPedido(
  detallePedido: DetallePedidoTabla[],
  item: number,
  descuento: number
): ResultadoAgregarItem {
  const newItems = [...detallePedido];
  newItems[item].dp_descuento = descuento;
  newItems[item].subtotal = newItems[item].dp_precio * newItems[item].dp_cantidad - (newItems[item].dp_descuento || 0);
  return { ok: true, detallePedido: newItems };
}

export function actualizarBonificacionItemPedido(
  detallePedido: DetallePedidoTabla[],
  item: number,
  bonificacion: number
): ResultadoAgregarItem {
  const newItems = [...detallePedido];
  newItems[item].dp_bonif = bonificacion;
  return { ok: true, detallePedido: newItems };
}

export function actualizarDescripcionItemPedido(
  detallePedido: DetallePedidoTabla[],
  item: number,
  puedeActualizar: number,
  descripcion_nueva: string
): ResultadoAgregarItem {
  const newItems = [...detallePedido];
  if (puedeActualizar === 1) {
    newItems[item].dp_descripcion_art = descripcion_nueva;
    newItems[item].descripcion = descripcion_nueva;
  }
  return { ok: true, detallePedido: newItems };
}


