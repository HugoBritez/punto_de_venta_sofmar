import api from "@/config/axios";
import { PedidoDetalle } from "../types/pedidos";
import { Pedido } from "@/views/pedidos/FormularioPedidos/types/shared.type";

export const anularPedido = async (detalleFaltante: number) => {
    const response = await api.post(`pedidos/anular-faltante`, { detalleFaltante});
    return response.data.body;
}

export const cambiarLote =  async (idDetallePedido: number, lote: string, idLote: number) => {
    const response = await api.post(`pedidos/cambiar-lote`, {
            idDetallePedido,
            lote,
            idLote
         });
    return response.data;
}

export const getPedidosProveedor = async (fecha_desde: string, fecha_hasta: string, proveedor: number, cliente?: number, nroPedido?: number, vendedor?: number, articulo?: number, moneda?: number, estado?: number) => {
    console.log("params en getpedidos", {
        fecha_desde,
        fecha_hasta,
        proveedor,
        cliente,
        nroPedido,
        vendedor,
        articulo,
        moneda,
        estado
    });
    const response = await api.get(`pedidos/reporte-pedidos-proveedor`, {
        params: {
            fecha_desde,
            fecha_hasta,
            proveedor,
            cliente,
            nroPedido,
            vendedor,
            articulo,
            moneda,
            estado
        }
    });
    return response.data.body;
}   


export const getPedidosDetalle = async (pedidoId: number): Promise<PedidoDetalle[]> => {
    const response = await api.get(`pedidos/detalles`, {
        params: {
            codigo: pedidoId
        }
    });
    console.log(response.data.body);
    return response.data.body;
}

export const getPedidosDetalleProveedor = async (codigo: number, proveedor: number): Promise<PedidoDetalle[]> => {
    const response = await api.get(`pedidos/detalles-proveedor`, {
        params: {
            codigo,
            proveedor
        }
    });
    return response.data.body;
}


export const getPedidosPorCliente = async (clienteRuc: string): Promise<Pedido[]> => {
    const response = await api.get(`pedidos/cliente/${clienteRuc}`);
    return response.data.body;
}

