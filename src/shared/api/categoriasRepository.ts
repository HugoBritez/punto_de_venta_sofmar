import type { CategoriaViewModel } from "../types/categoria";
import api from "../../config/axios";

export const categoriasRepository = {
    async getCategorias(busqueda?: string): Promise<CategoriaViewModel[]> {
        const response = await api.get(`categorias`, {
            params: { busqueda }
        });
        return response.data.body;
    }
}