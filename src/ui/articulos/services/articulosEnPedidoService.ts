import { api_url } from "@/utils";
import axios from "axios";
import { ArticuloPedido } from "../types/articulopedido.type";

export const getArticulosEnPedido = async (articulo_id: number): Promise<ArticuloPedido[]> => {
    try{
        const response = await axios.get(`${api_url}articulos/pedido/${articulo_id}`);
        return response.data;
    }catch(error){
        console.error("Error al obtener articulos en pedido:", error);
        throw error;
    }
}
