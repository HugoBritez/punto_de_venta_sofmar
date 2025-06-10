import { TipoDocumento } from "@/models/viewmodels/TipoDocumento";
import { api_url } from "@/utils";
import axios from "axios";

export const tipoDocumentoRepository = {
    async getAll(): Promise<TipoDocumento[]> {
        const TipoDocumento = await axios.get(`${api_url}tipodocumento`);
        console.log("tipos de documento" + TipoDocumento.data.body);
        return TipoDocumento.data.body;
    }
}