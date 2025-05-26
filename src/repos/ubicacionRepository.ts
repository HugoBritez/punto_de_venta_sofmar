import { UbicacionViewModel } from "@/models/viewmodels/ubicacionViewModel";
import { ResponseViewModel } from "@/models/base/responseViewModel";
import axios from "axios";
import { api_url } from "@/utils";


export const UbicacionRepository = {
    async GetUbicaciones(busqueda?: string): Promise<ResponseViewModel<UbicacionViewModel[]>> {
        const response = await axios.get(`${api_url}/ubicaciones`, { params: { busqueda } });
        return response.data;
    },

    
}