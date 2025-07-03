import axios from "axios";
import { ListaArticulo } from "../types/ListaArticulo";
import { api_url } from "@/shared/consts/expres_api_url";

export interface getListaParams  {
    busqueda: string;
    estado?: number | null;
    marca: boolean;
    proveedor: boolean;
    categoria: boolean;
}

export const getListaArticulos = async (params: getListaParams): Promise<ListaArticulo[]> => {
    const response = await axios.get(`${api_url}articulos/listar`, {
        params: {
            busqueda: params.busqueda,
            estado: params.estado,
            marca: params.marca,
            proveedor: params.proveedor,
            categoria: params.categoria,
        }
    })
    console.log("response en lisa de articulos", response.data)
    return response.data.body;
}