import type { ConfiguracionViewModel } from "../types/configuraciones";
import api from "../../config/axios";

export const ConfiguracionesRepository = {
    async getConfiguracionById(id: number): Promise<ConfiguracionViewModel> {
        const response = await api.get(`configuraciones`, {
            params : {
                id: id
            }
        });
        console.log("Configuracion con id" + id +  ":"  + response)
        return response.data.body;
    }
}