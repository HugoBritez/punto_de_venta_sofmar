import type { Ciudad } from "../types/ciudad";
import api from "../../config/axios";

export const getCiudades =async  (busqueda?: string): Promise<Ciudad[]> =>{
    const response = await api.get(`ciudades`,
        {
            params : {
                busqueda: busqueda
            }
        }
    );

    return response.data.body;
}