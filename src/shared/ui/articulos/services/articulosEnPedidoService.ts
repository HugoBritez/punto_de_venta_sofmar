import { api_url } from "@/utils";
import axios from "axios";
import { ArticuloPedido } from "../types/articulopedido.type";

export const getArticulosEnPedido = async (articulo_id: number, id_lote: number): Promise<ArticuloPedido[]> => {
    try{
        const response = await axios.get(`${api_url}articulo/pedido`,{
            params: {
                articulo_id,
                id_lote
            }
        });
        console.log("response", response.data);
        return response.data.body;
    }catch(error){
        console.error("Error al obtener articulos en pedido:", error);
        throw error;
    }
}
