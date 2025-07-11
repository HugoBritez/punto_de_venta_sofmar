
import { Inventario } from "../types/inventario.type";
import api from "@/config/axios";

export interface GetInventariosFilters {
    estado: number;
    deposito: number;
    nro_inventario: string;
}

export const getInventarios = async (filters: GetInventariosFilters)=>{
    const response = await api.get(`inventarios`, {params: {
        estado: filters.estado,
        deposito: filters.deposito,
        nro_inventario: filters.nro_inventario
    }});
    return response.data.body;
}

export const createInventario = async (inventario: Inventario)=>{
    const response = await api.post(`inventarios`, inventario);
    return response.data.body;
}

export const anularInventario = async (id: number)=>{
    const response = await api.post(`inventarios/anular/${id}`);
    return response.data.body;
}

export const autorizarInventario = async (id: number)=>{
    const response = await api.post(`inventarios/autorizar/${id}`);
    return response.data.body;
}

export const cerrarInventario = async (id: number)=>{
    const response = await api.post(`inventarios/cerrar/${id}`);
    return response.data.body;
}

export const revertirInventario = async (id: number)=>{
    const response = await api.post(`inventarios/revertir/${id}`);
    return response.data.body;
}
