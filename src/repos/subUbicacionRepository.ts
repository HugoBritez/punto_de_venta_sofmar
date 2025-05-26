import { SubUBicacionViewModel } from "@/models/viewmodels/subUbicacionViewModel";
import { ResponseViewModel } from "@/models/base/responseViewModel";
import axios from "axios";
import { api_url } from "@/utils";



export const SubUbicacionRepository = {
    async GetSububicaciones(busqueda?: string): Promise<ResponseViewModel<SubUBicacionViewModel[]>> {
        const response = await axios.get(`${api_url}/sububicaciones`, { params: { busqueda } });
        return response.data;
    }
}