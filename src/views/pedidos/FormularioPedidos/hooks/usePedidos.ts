import { useState } from "react";
import { pedidosApi } from "../services/pedidosApi";
import {  PedidoDTO, DetallePedidoDTO } from "../types/shared.type";

export const usePedidos = () => {
    const [loadingDTO, setLoadingDTO] = useState(false);
    const [errorDTO, setErrorDTO] = useState<string | null>(null);
    

    const insertarPedido = async (pedidoData: PedidoDTO, detalles: DetallePedidoDTO[]) => {
        try{
            setLoadingDTO(true);
            const response = await pedidosApi.insertarPedido(pedidoData, detalles);
            setLoadingDTO(false);
            return response;
        }catch(error){
            setErrorDTO("Error al insertar el pedido");
            setLoadingDTO(false);
        }
    }

    return {
        insertarPedido,
        loadingDTO,
        errorDTO,
    }
}
