import { useMutation, useQueryClient } from "@tanstack/react-query";
import { anularPedido, cambiarLote } from "@/shared/api/pedidosRepository";

export const useAnularPedido = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: {codigo: number}) => anularPedido(data.codigo),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["pedidos-faltantes"]});
        }
    });
}


export const useCambiarLote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: {idDetallePedido: number, lote: string, idLote: number}) => cambiarLote(data.idDetallePedido, data.lote, data.idLote),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["pedidos-faltantes"]});
            queryClient.invalidateQueries({queryKey: ["lotes-articulo"]});
            
        }
    });
}