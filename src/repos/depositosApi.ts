import axios from "axios";
import { API_URL as api_url } from "@/utils";
import { GetDepositoDTO } from "@/models/dtos/getDepositoDTO";
import { DepositoViewModel } from "@/models/viewmodels/depositoViewModel";
import { ResponseViewModel } from "@/models/base/responseViewModel";

// Define explicit type for the response
export const getDepositos = async (params?: GetDepositoDTO): Promise<ResponseViewModel<DepositoViewModel[]>> => {
    const response = await axios.get<ResponseViewModel<DepositoViewModel[]>>(`${api_url}depositos/`,
        {
            params: {
                sucursal: params?.sucursal,
                usuario: params?.usuario,
                descripcion: params?.descripcion
            }
        })
    return response.data;
}