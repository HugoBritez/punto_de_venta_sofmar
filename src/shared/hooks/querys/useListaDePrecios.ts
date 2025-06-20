import { useQuery } from "@tanstack/react-query";
import { ListaPrecioRepository } from "../../api/listaPrecioRepository";

export const useListaDePrecios = () => {
    return useQuery({
        queryKey: ['listadeprecios'],
        queryFn: () => ListaPrecioRepository.GetListaPrecios(),
        enabled: true,
        refetchOnWindowFocus: false
    })
}


export const useListaDePreciosPorCliente = (clienteId: number) => {
    return useQuery({
        queryKey: ['listadepreciosporcliente', clienteId],
        queryFn: () => ListaPrecioRepository.GetListaPrecioPorCliente(clienteId),
        enabled: !!clienteId,
        refetchOnWindowFocus: false
    })
}