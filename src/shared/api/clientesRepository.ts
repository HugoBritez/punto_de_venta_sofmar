import type { ClienteViewModel } from "../types/clientes";
import api from "../../config/axios";



export const ClientesRepository = {
    async buscarClientes(busqueda?: string, estado: number = 1): Promise<ClienteViewModel[]> {
        const response = await api.get(`clientes`, {
            params: {
                busqueda: busqueda,
                estado: estado
            }
        });
        return response.data.body;
    },

    async getClientePorId(id: number): Promise<ClienteViewModel> {
         const response = await api.get(`clientes`,
            {
                params: {
                    id: id
                }
            }
        );

        return response.data.body[0];
    }
}