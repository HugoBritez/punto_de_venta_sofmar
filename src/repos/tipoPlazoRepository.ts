import { api_url } from "@/utils";
import axios from "axios";

export interface TipoPlazo
{
    codigo: number;
    descripcion: string;
}

export const getTipoPlazo = async(): Promise<TipoPlazo[]> => {
    const response = await axios.get(`${api_url}tipo-plazo`);
    return response.data.body;
}