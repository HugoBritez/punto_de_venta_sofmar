import api from "../../config/axios";
import type { UbicacionViewModel } from "../types/ubicacion";



export const UbicacionRepository = {
    async GetUbicaciones(busqueda?: string): Promise<UbicacionViewModel[]> {
        const response = await api.get(`ubicaciones`, { params: { busqueda } });
        return response.data;
    },

    
}