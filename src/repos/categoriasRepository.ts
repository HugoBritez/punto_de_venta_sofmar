import { api_url } from "@/utils";
import { CategoriaViewModel } from "@/models/viewmodels/categoriaViewModel";
import axios from "axios";
import { ResponseViewModel } from "@/models/base/responseViewModel";

export const categoriasRepository = {
    async getCategorias(busqueda?: string): Promise<ResponseViewModel<CategoriaViewModel[]>> {
        const response = await axios.get(`${api_url}/categorias`, {
            params: { busqueda }
        });
        return response.data;
    }
}