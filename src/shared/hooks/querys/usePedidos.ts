import { useQuery } from "@tanstack/react-query";
import { getPedidosDetalle, getPedidosDetalleProveedor, getPedidosProveedor } from "@/shared/api/pedidosRepository";

export const usePedidosProveedor = (fecha_desde: string, fecha_hasta: string, proveedor: number, cliente?: number, nroPedido?: number, vendedor?: number, articulo?: number, moneda?: number, estado?: number) => {
    return useQuery({
        queryKey: ['pedidos-proveedor', fecha_desde, fecha_hasta, proveedor, cliente, nroPedido, vendedor, articulo, moneda, estado],
        queryFn: () => getPedidosProveedor(fecha_desde, fecha_hasta, proveedor, cliente, nroPedido, vendedor, articulo, moneda, estado),
        enabled: !!fecha_desde && !!fecha_hasta && !!proveedor,
    });
}

export const usePedidosDetalle = (pedidoId: number) => {
    return useQuery({
        queryKey: ['pedidos-detalle', pedidoId],
        queryFn: () => getPedidosDetalle(pedidoId),
        enabled: !!pedidoId,
    });
}

export const usePedidosDetalleProveedor = (codigo: number, proveedor: number) => {
    return useQuery({
        queryKey: ['pedidos-detalle-proveedor', codigo, proveedor],
        queryFn: () => getPedidosDetalleProveedor(codigo, proveedor),
        enabled: !!codigo && !!proveedor,
    });
}