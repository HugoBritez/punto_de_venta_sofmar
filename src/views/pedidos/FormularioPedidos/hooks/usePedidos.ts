import { useState } from "react";
import { pedidosApi } from "../services/pedidosApi";
import { PedidoDTO, DetallePedidoDTO } from "../types/shared.type";
import { useToast } from "@chakra-ui/react";

export const usePedidos = () => {
    const [loadingDTO, setLoadingDTO] = useState(false);
    const [errorDTO, setErrorDTO] = useState<string | null>(null);
    const toast = useToast();
    
    const insertarPedido = async (pedidoData: PedidoDTO, detalles: DetallePedidoDTO[]) => {
        try {
            setLoadingDTO(true);
            const response = await pedidosApi.insertarPedido(pedidoData, detalles);
            setLoadingDTO(false);
            
            toast({
                title: "Éxito",
                description: "El pedido se ha guardado correctamente",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            return response;
        } catch (error) {
            setErrorDTO("Error al insertar el pedido");
            setLoadingDTO(false);
            toast({
                title: "Error",
                description: "Hubo un error al guardar el pedido",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            
            throw error;
        }
    }
    
    return {
        insertarPedido,
        loadingDTO,
        errorDTO,
    }
}
