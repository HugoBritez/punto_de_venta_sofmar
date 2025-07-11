import api from "@/config/axios";

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