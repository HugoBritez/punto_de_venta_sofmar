import type { TipoDocumento } from "../types/tipoDocumento";
import api from "../../config/axios";

export const tipoDocumentoRepository = {
    async getAll(): Promise<TipoDocumento[]> {
        const TipoDocumento = await api.get(`tipodocumento`);
        console.log("tipos de documento" + TipoDocumento.data.body);
        return TipoDocumento.data.body;
    }
}