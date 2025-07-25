import type { ClienteViewModel, CobroViewModel } from "../types/clientes";
import api from "../../config/axios";
import { Cliente } from "@/types/shared_interfaces";



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
         const response = await api.get(`clientes/id`,
            {
                params: {
                    id: id
                }
            }
        );

        return response.data.body[0];
    },

    async getClientePorRuc(ruc: string): Promise<Cliente> {
        const response = await api.get(`clientes/${ruc}`);
        return response.data.body;
    },

    async getClientePorDefecto(): Promise<ClienteViewModel> {
        const response = await api.get(`clientes/defecto`);
        return response.data.body;
    },


    async getUltimoCobro(clienteRuc: string): Promise<CobroViewModel> {
        const response = await api.get(`clientes/ultimo-cobro/${clienteRuc}`);
        return response.data.body;
    },

    async getDeuda(clienteRuc: string): Promise<number> {
        const response = await api.get(`clientes/deuda/${clienteRuc}`);
        return response.data.body;
    }
}