import type { getSucursalDTO, SucursalViewModel } from "../types/sucursal";
import api from "../../config/axios";


export const getSucursales = async (params?: getSucursalDTO): Promise<SucursalViewModel[]> => {
    const response = await api.get(`sucursales/`,
        {
            params: {
                operador: params?.operador,
                matriz: params?.matriz
            }
        }
    );

    return response.data.body;
}