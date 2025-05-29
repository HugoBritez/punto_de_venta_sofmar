import axios from "axios";
import { api_url } from "@/utils";
import { ResponseViewModel } from "@/models/base/responseViewModel";
import { Moneda } from "@/models/viewmodels/MonedaViewModel";


export const getMonedas: ()=> Promise<Moneda[]> = async () => {
    const response = await axios.get(`${api_url}monedas/`)
    return response.data.data
}