import { ClienteViewModel } from "@/models/viewmodels/ClienteViewModel";
import axios from "axios";
import { api_url } from "@/utils";
import { ResponseViewModel } from "@/models/base/responseViewModel";
import { ClienteBusquedaDTO } from "@/models/dtos/clienteBusquedaDTO";



export const ClientesRepository = {
    async getClientes(params: ClienteBusquedaDTO): Promise<ResponseViewModel<ClienteViewModel[]>> {
        const response = await axios.get(`${api_url}/clientes`, {
            params: {
                busqueda: params.busqueda,
                id: params.id,
                interno: params.interno,
                vendedor: params.vendedor,
                estado: params.estado
            }
        });
        return response.data;
    },
}