import { ClienteViewModel } from "@/models/viewmodels/ClienteViewModel";
import axios from "axios";
import { API_URL as api_url } from "@/utils";



export const ClientesRepository = {
    async buscarClientes(busqueda?: string, estado: number = 1): Promise<ClienteViewModel[]> {
        const response = await axios.get(`${api_url}clientes`, {
            params: {
                busqueda: busqueda,
                estado: estado
            }
        });
        return response.data.body;
    },

    async getClientePorId(id: number): Promise<ClienteViewModel> {
         const response = await axios.get(`${api_url}clientes`,
            {
                params: {
                    id: id
                }
            }
        );

        return response.data.body[0];
    }
}