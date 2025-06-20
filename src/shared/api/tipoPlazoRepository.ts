import api from "../../config/axios";

export interface TipoPlazo
{
    codigo: number;
    descripcion: string;
}

export const getTipoPlazo = async(): Promise<TipoPlazo[]> => {
    const response = await api.get(`tipo-plazo`);
    return response.data.body;
}