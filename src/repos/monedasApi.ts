import axios from "axios";
import { API_URL as api_url } from "@/utils";
import { Moneda } from "@/models/viewmodels/MonedaViewModel";


export const getMonedas: ()=> Promise<Moneda[]> = async () => {
    const response = await axios.get(`${api_url}monedas/`)
    return response.data.body
}