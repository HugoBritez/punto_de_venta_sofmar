import { useQuery } from "@tanstack/react-query";
import { ClientesRepository } from "../../api/clientesRepository";

export const useClientePorId = (param: number) => {
    return useQuery({
        queryKey: ['clientePorId', param],
        queryFn: ()=> ClientesRepository.getClientePorId(param),
        enabled: true,
        refetchOnWindowFocus: false
    })
}

export const useBuscarClientes = (busqueda: string) => {
    return useQuery({
        queryKey: ['buscarClientes', busqueda],
        queryFn: ()=> ClientesRepository.buscarClientes(busqueda),
        enabled: true,
        refetchOnWindowFocus: false
    }) 
}