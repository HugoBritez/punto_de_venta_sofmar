import { api_url } from "@/utils";
import axios from "axios";
import { BusquedaDTO } from "../types/BusquedaDTO.type";
import { ClienteViewModel } from "../types/cliente.type";
export const clientesApi = {
    getClientes: async (busqueda: BusquedaDTO): Promise<ClienteViewModel[]> => {
        try {
            const response = await axios.get(`${api_url}clientes/get-clientes`, {
                params: {
                    buscar: busqueda.busqueda,
                    limite: busqueda.limite,
                    estado: busqueda.inactivos,
                    saldocero: busqueda.saldocero
                }
            });
            console.log('response en clienteApi', response.data);
            return response.data.body;
        } catch (error) {
            console.error("Error al obtener clientes:", error);
            throw error;
        }
    }
}
