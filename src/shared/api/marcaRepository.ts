import type { MarcaViewModel } from "../types/marcas";
import api from "../../config/axios";


export const marcaRepository = {

    async GetMarcas(busqueda?: string): Promise<MarcaViewModel[]> {
        const response = await api.get(`marcas`, {
            params: {
                busqueda: busqueda
            }
        });
        return response.data.body;
    },
}