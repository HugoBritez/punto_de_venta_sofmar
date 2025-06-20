import type { Departamento } from "../types/departamento";
import api from "../../config/axios";


export const getDepartamentos =  async (busqueda?: string): Promise<Departamento[]> => {
    const response = await api.get(`departamentos/`, {
        params : {
            busqueda: busqueda
        }
    });

    return response.data.body;
} 