import { ListaPrecioRepository } from "@/repos/listaPrecioRepository"
import {  useMutation, useQueryClient } from "@tanstack/react-query"

export const useCrearListaDePreciosPorCliente = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params : { clienteId: number, listaDepPreciosId: number})=> {
            return await ListaPrecioRepository.CrearListaPrecioPorCliente(params.clienteId, params.listaDepPreciosId);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ['listadepreciosporcliente']
            })
            return data;
        }
    })
}