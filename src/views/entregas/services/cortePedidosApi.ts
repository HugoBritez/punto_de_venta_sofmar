import { api_url } from "@/utils";
import axios from "axios";
import { FiltrosPedidoFaltante } from "../types/shared.type";

export const cortePedidosApi = {
  agregarPedidoFaltante: async (detalle_id: number, cantidad: number, observacion?: string) => {
    try {
      const response = await axios.post(
        `${api_url}pedidos/insertar-detalle-faltante`,
        {
          detalle_id,
          cantidad,
          observacion
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al agregar pedido faltante:", error);
      throw error;
    }
  },

  getPedidoFaltante: async (filtros: FiltrosPedidoFaltante) => {
    try{
        const response = await axios.get(`${api_url}pedidos/pedidos-faltantes`, {
            params: filtros
        })
        console.log('response en el api', response.data);
        return response.data.body;
    } catch (error) {
        console.error("Error al obtener pedido faltante:", error);
        throw error;
    }
  }
};
