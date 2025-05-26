import { useQuery } from "@tanstack/react-query";
import { ListaPrecioRepository } from "@/repos/listaPrecioRepository";

export const useListaDePrecios = () => {
    return useQuery({
        queryKey:['listadeprecios'],
        queryFn: () => ListaPrecioRepository.GetListaPrecios(),
        enabled: true,
        refetchOnWindowFocus: false
    })
}