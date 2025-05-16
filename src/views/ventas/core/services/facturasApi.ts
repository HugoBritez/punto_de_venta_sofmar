import axios from "axios";
import { api_url } from "../../../../utils";

export interface DatosFacturacion {
    d_establecimiento: string;
    d_p_emision: string;
    d_nro_secuencia: number;
    d_nrotimbrado: string;
    d_codigo: number;
}

export const getDatosFacturacion = async (operador: string) => {
    const response = await axios.get(`${api_url}definicion-ventas/timbrado`, {
        params: {
            usuario: operador,
        },
    });

    return response.data;
}