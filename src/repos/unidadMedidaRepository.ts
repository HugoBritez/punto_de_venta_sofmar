import { UnidadMedidaViewModel } from "@/models/viewmodels/unidadMedidaViewModel";
import { ResponseViewModel } from "@/models/base/responseViewModel";
import axios from "axios";
import { api_url } from "@/utils";


export const UnidadMedidaRepository = {

    async GetUnidadesMedida(busqueda?: string): Promise<ResponseViewModel<UnidadMedidaViewModel[]>> {
        const response = await axios.get(`${api_url}/unidadmedidas`, { params: { busqueda } });
        return response.data;
    }
}