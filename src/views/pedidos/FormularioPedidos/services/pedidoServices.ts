// src/services/pedidoService.ts

import { Articulo } from "@/ui/articulos/types/articulo.type";
import { DetallePedidoTabla } from "@/views/pedidos/FormularioPedidos/types/shared.type";
import {
  ListaPrecios,
  Moneda,
  Deposito,
  Sucursal,
} from "@/types/shared_interfaces";
import { Operador } from "@/stores/operadoresStore";

interface ParamsAgregarItem {
  articulo: Articulo;
  cantidad: number;
  precioSeleccionado: ListaPrecios;
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

// Función para convertir fecha de DD/MM/YYYY a YYYY-MM-DD
const formatearFechaParaBD = (fecha: string): string => {
  if (!fecha || fecha === "01/01/1900") {
    return "1900-01-01";
  }
  
  // Si ya está en formato YYYY-MM-DD, retornarlo tal como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return fecha;
  }
  
  // Si está en formato DD/MM/YYYY, convertirlo
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
    const [dia, mes, anio] = fecha.split('/');
    return `${anio}-${mes}-${dia}`;
  }
  
  // Si no coincide con ningún formato conocido, retornar fecha por defecto
  return "1900-01-01";
};

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
  if (!precioSeleccionado?.lp_codigo) {
    return { ok: false, error: "Debe seleccionar un precio" };
  }
  if (!monedaSeleccionada?.mo_codigo) {
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
    if (monedaSeleccionada?.mo_codigo === 1) {
      // Guaraníes: puedes elegir entre varios precios
      switch (precioSeleccionado?.lp_codigo) {
        case 1:
          precioAUsar = articulo.precio_venta_guaranies;
          break;
        case 2:
          precioAUsar = articulo.precio_credito;
          break;
        case 3:
          precioAUsar = articulo.precio_mostrador;
          break;
        default:
          precioAUsar = articulo.precio_venta_guaranies;
          break;
      }
    } else {
      // Otras monedas: solo puedes usar el precio correspondiente a la moneda
      switch (monedaSeleccionada?.mo_codigo) {
        case 2:
          precioAUsar = articulo.precio_venta_dolar;
          break;
        case 3:
          precioAUsar = articulo.precio_venta_real;
          break;
        case 4:
          precioAUsar = articulo.precio_venta_pesos;
          break;
        default:
          precioAUsar = articulo.precio_venta_guaranies;
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
    dp_articulo: articulo.id_articulo,
    dp_cantidad: cantidad,
    dp_precio: precioAUsar,
    dp_descuento: descuento || 0,
    dp_exentas: exentas || 0,
    dp_cinco: cinco || 0,
    dp_diez: diez || 0,
    dp_lote: articulo.lote || "",
    dp_vence: formatearFechaParaBD(articulo.vencimiento_lote),
    dp_vendedor: vendedorSeleccionado?.op_codigo,
    dp_codigolote: articulo.id_lote,
    dp_facturado: 0,
    dp_porcomision: 0,
    dp_actorizado: 0,
    dp_habilitar: 0,
    dp_bonif: bonificacion || 0,
    dp_descripcion_art: "",
    dp_obs: "",
    cantidad_cargada: 0,
    codigo: articulo.codigo_barra,
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


