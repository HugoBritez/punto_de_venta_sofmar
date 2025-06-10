import { API_URL } from "@/utils";
import axios from "axios";
import { Departamento } from "@/models/viewmodels/DepartamentoViewModel";


export const getDepartamentos =  async (busqueda?: string): Promise<Departamento[]> => {
    const response = await axios.get(`${API_URL}departamentos/`, {
        params : {
            busqueda: busqueda
        }
    });

    return response.data.body;
} 