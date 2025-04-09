import { api_url } from "@/utils";
import axios from "axios";
import { PedidoDTO, DetallePedidoDTO, Pedido, DetallePedido } from "../types/shared.type";

export interface PedidosResponse {
    body: Pedido[];
    error: boolean;
    status: number;
}

export interface DetallesPedidoResponse {
    body: DetallePedido[];
    error: boolean;
    status: number;
}


export const pedidosApi = {
    insertarPedido: async (pedidoData: PedidoDTO, detalles: DetallePedidoDTO[]) =>{
        try {
            const response = await axios.post(`${api_url}pedidos/agregar-pedido`, {
                pedido: pedidoData,
                detalle_pedido: detalles,
            });
            return response.data;
        } catch (error) {
            console.error("Error al insertar el pedido:", error);
            throw error;
        }
    },
}
