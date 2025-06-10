import { API_URL as api_url } from "@/utils";
import axios from "axios";
import { MarcaViewModel } from "@/models/viewmodels/MarcaViewModel";
import { ResponseViewModel } from "@/models/base/responseViewModel";


export const marcaRepository = {

    async GetMarcas(busqueda?: string): Promise<ResponseViewModel<MarcaViewModel[]>> {
        const response = await axios.get(`${api_url}/marcas`, {
            params: {
                busqueda: busqueda
            }
        });
        return response.data;
    },
}