import { ListaPrecio } from "@/models/viewmodels/ListaPrecioViewModel";
import axios from "axios";
import { API_URL as api_url } from "@/utils";

export const ListaPrecioRepository = {

    async GetListaPrecios(): Promise<ListaPrecio[]> {
        const response = await axios.get(`${api_url}lista-precios`);
        console.log("Lista de precios response:", response.data);
        return response.data.body;
    },

    async GetListaPrecioPorCliente(clienteId: number): Promise<ListaPrecio[]> {
        const response = await axios.get(`${api_url}lista-precios/cliente`, {
            params: {
                clienteId: clienteId
            }
        })

        return response.data.body;
    },

    async CrearListaPrecioPorCliente(clienteId: number, precioId: number): Promise<ListaPrecio>{
        const response = await axios.post(`${api_url}lista-precios/cliente`, {
            clienteId: clienteId,
            precioId: precioId
        });

        return response.data.body;
    }
}