import axios from "axios";
import { api_url } from "@/utils";
import { SucursalViewModel } from "@/models/viewmodels/sucursalViewModel";
import { getSucursalDTO } from "@/models/dtos/getSucursalesDTO";
import { ResponseViewModel } from "@/models/base/responseViewModel";


export const getSucursales = async (params?: getSucursalDTO): Promise<ResponseViewModel<SucursalViewModel>> => {
    const response = await axios.get(`${api_url}sucursales/`,
        {
            params: {
                operador: params?.operador,
                matriz: params?.matriz
            }
        }
    );

    return response.data;
}