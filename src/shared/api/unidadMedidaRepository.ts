import type { UnidadMedidaViewModel } from "../types/unidadMedida";
import api from "../../config/axios";


export const UnidadMedidaRepository = {

    async GetUnidadesMedida(busqueda?: string): Promise<UnidadMedidaViewModel[]> {
        const response = await api.get(`unidadmedidas`, { params: { busqueda } });
        return response.data;
    }
}