import { api_url } from "@/utils";
import axios from "axios";
import { Zona } from "@/models/viewmodels/ZonaViewModel";

export const getZonas = async (busqueda?: string): Promise<Zona[]> => {
    const response = await axios.get(
        `${api_url}zonas`,
        {
            params: {
                busqueda: busqueda
            }
        }
    );

    return response.data.body;
}