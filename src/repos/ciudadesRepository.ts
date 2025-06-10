import { API_URL } from "@/utils";
import axios from "axios";
import { Ciudad } from "@/models/viewmodels/CiudadViewModel";

export const getCiudades =async  (busqueda?: string): Promise<Ciudad[]> =>{
    const response = await axios.get(`${API_URL}ciudades`,
        {
            params : {
                busqueda: busqueda
            }
        }
    );

    return response.data.body;
}