import type { ListaPrecio } from "../types/listaPrecio";
import api from "../../config/axios";

export const ListaPrecioRepository = {

    async GetListaPrecios(): Promise<ListaPrecio[]> {
        const response = await api.get(`lista-precios`);
        console.log("Lista de precios response:", response.data);
        return response.data.body;
    },

    async GetListaPrecioPorCliente(clienteId: number): Promise<ListaPrecio[]> {
        const response = await api.get(`lista-precios/cliente`, {
            params: {
                clienteId: clienteId
            }
        })

        return response.data.body;
    },

    async CrearListaPrecioPorCliente(clienteId: number, precioId: number): Promise<ListaPrecio>{
        const response = await api.post(`lista-precios/cliente`, {
            clienteId: clienteId,
            precioId: precioId
        });

        return response.data.body;
    }
}