import type { Moneda } from "../types/moneda";
import api from "../../config/axios";


export const getMonedas: ()=> Promise<Moneda[]> = async () => {
    const response = await api.get(`monedas/`)
    return response.data.body
}