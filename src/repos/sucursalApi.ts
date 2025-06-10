import axios from "axios";
import { api_url } from "@/utils";
import { SucursalViewModel } from "@/models/viewmodels/sucursalViewModel";
import { getSucursalDTO } from "@/models/dtos/getSucursalesDTO";


export const getSucursales = async (params?: getSucursalDTO): Promise<SucursalViewModel[]> => {
    const response = await axios.get(`${api_url}sucursales/`,
        {
            params: {
                operador: params?.operador,
                matriz: params?.matriz
            }
        }
    );

    console.log("sucursales", response.data.body)

    return response.data.body;
}