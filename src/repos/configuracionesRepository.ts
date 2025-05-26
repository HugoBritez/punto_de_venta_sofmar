import { ConfiguracionViewModel } from "@/models/viewmodels/ConfiguracionesViewModel";
import axios from "axios";
import { api_url } from "@/utils";
import { ResponseViewModel } from "@/models/base/responseViewModel";


export const ConfiguracionesRepository = {
    async getConfiguracionById(id: number): Promise<ResponseViewModel<ConfiguracionViewModel>> {
        const response = await axios.get(`${api_url}/configuraciones/${id}`);
        return response.data;
    }
}