import api from "../../config/axios";

export interface GrupoCliente
{
    id: number;
    descripcion: string;
}

export const getGruposClientes = async (): Promise<GrupoCliente[]> => {
    const response = await api.get(`grupo-clientes/`);
    return response.data.body;
}