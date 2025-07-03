import { useMutation, useQueryClient } from "@tanstack/react-query";
import { anularPedido } from "@/shared/api/pedidosRepository";

export const useAnularPedido = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: {codigo: number, motivo: string}) => anularPedido(data.codigo, data.motivo),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["pedidos-faltantes"]});
        }
    });
}