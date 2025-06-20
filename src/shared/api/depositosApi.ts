import type { GetDepositoDTO } from "../types/depositos";
import type { DepositoViewModel } from "../types/depositos";
import api from "../../config/axios";

// Define explicit type for the response
export const getDepositos = async (params?: GetDepositoDTO): Promise<DepositoViewModel[]> => {
    const response = await api.get(`depositos/`,
        {
            params: {
                sucursal: params?.sucursal,
                usuario: params?.usuario,
                descripcion: params?.descripcion
            }
        })

    return response.data.body;
}