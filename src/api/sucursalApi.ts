import axios from "axios";
import { api_url } from "@/utils";

export interface Sucursal {
    id: number;
    descripcion: string;
    direccion: string;
    nombre_emp: string;
    ruc_emp: string;
    matriz: number;
}

export const getSucursales = async (id_usuario?: number): Promise<Sucursal[]> => {
    const response = await axios.get(`${api_url}sucursales/`,
        {
            params: {
                operador: id_usuario
            }
        }
    );

    console.log("response en sucursal api", response.data);
    return response.data;
}