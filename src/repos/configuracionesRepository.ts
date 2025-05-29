import { ConfiguracionViewModel } from "@/models/viewmodels/ConfiguracionesViewModel";
import axios from "axios";
import { api_url } from "@/utils";

export const ConfiguracionesRepository = {
    async getConfiguracionById(id: number): Promise<ConfiguracionViewModel> {
        const response = await axios.get(`${api_url}configuraciones`, {
            params : {
                id: id
            }
        });
        return response.data.data;
    }
}