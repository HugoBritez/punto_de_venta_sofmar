import type { SubUBicacionViewModel } from "../types/subUbicacion";
import api from "../../config/axios";



export const SubUbicacionRepository = {
    async GetSububicaciones(busqueda?: string): Promise<SubUBicacionViewModel[]> {
        const response = await api.get(`sububicaciones`, { params: { busqueda } });
        return response.data;
    }
}