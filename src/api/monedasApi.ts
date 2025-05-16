import axios from "axios";
import { api_url } from "@/utils";

export interface Moneda {
    moCodigo: number;
    moDescripcion: string;
    moObs: string;
}

export const getMonedas: ()=> Promise<Moneda[]> = async () => {
    const response = await axios.get(`${api_url}monedas/`)
    return response.data
}