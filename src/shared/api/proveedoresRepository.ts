import type { ProveedoresViewModel } from "../types/proveedores";
import api from "../../config/axios";


export const ProveedorRepository = {
    async GetProveedores(busqueda?: string): Promise<ProveedoresViewModel[]> {
        const response = await api.get(`proveedores`, { params: { busqueda } });
        return response.data.body;
    }
}