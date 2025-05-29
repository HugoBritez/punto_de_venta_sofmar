import { api_url } from "@/utils";
import axios from "axios";
import { ConfiguracionViewModel } from "@/models/viewmodels/ConfiguracionesViewModel";


export const getConfiguracionesPorId = async (id: number): Promise<ConfiguracionViewModel> => {
    const response = await axios.get(`${api_url}configuraciones/`,
        {
            params: {
                id: id
            }
        }
    );

    console.log("Configuraciones response:", response.data.data);
    return response.data.data;
}
