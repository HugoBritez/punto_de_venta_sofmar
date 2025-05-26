import { ProveedoresViewModel } from "@/models/viewmodels/proveedoresViewModel";
import { ResponseViewModel } from "@/models/base/responseViewModel";
import axios from "axios";
import { api_url } from "@/utils";


export const ProveedorRepository = {

    async GetProveedores(busqueda?: string): Promise<ResponseViewModel<ProveedoresViewModel[]>> {
        const response = await axios.get(`${api_url}/proveedores`, { params: { busqueda } });
        return response.data;
    }
}