import api from "@/config/axios";

export const anularPedido = async (codigo: number, motivo: string) => {
    const response = await api.post(`/pedidos/anular`, { codigo, motivo });
    return response.data;
}