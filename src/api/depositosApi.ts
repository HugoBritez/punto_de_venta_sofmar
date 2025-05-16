import axios from "axios";
import { api_url } from "@/utils";

export interface Deposito {
    dep_codigo: number;
    dep_descripcion: string;
    dep_principal: number;
}
interface DepositosParams {
    sucursal?: number;
    usuario?: number;
    descripcion?: string;
}

export const getDepositos = async (params: DepositosParams) => {
    const response = await axios.get(`${api_url}depositos/`,
        {
            params: {
                sucursal: params.sucursal,
                usuario: params.usuario,
                descripcion: params.descripcion
            }
        })
    return response.data
}