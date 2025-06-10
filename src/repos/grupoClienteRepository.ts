import { api_url } from "@/utils"
import axios from "axios";

export interface GrupoCliente
{
    id: number;
    descripcion: string;
}

export const getGruposClientes = async (): Promise<GrupoCliente[]> => {
    const response = await axios.get(`${api_url}grupo-clientes/`);
    return response.data.body;
}