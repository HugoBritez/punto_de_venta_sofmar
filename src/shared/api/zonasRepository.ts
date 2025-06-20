import api from "../../config/axios";
import type { Zona } from "../types/zona";

export const getZonas = async (busqueda?: string): Promise<Zona[]> => {
    const response = await api.get(
        `zonas`,
        {
            params: {
                busqueda: busqueda
            }
        }
    );

    return response.data.body;
}