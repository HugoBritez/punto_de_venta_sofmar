import { api_url } from "@/utils";
import axios from "axios";
import { Configuracion } from "./configuracion.type";


export const getConfiguracionesPorId = async (id: number): Promise<Configuracion> => {
    const response = await axios.get(`${api_url}configuraciones/por_id/`,
        {
            params: {
                ids: id
            }
        }
    );
    return response.data;
}
