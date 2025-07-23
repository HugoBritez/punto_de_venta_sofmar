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

export const useClientePorDefecto = () => {
    return useQuery({
        queryKey: ['clientePorDefecto'],
        queryFn: ()=> ClientesRepository.getClientePorDefecto(),
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


export const useUltimoCobro = (clienteRuc: string) => {
    return useQuery({
        queryKey: ['ultimoCobro', clienteRuc],
        queryFn: ()=> ClientesRepository.getUltimoCobro(clienteRuc),
        enabled: true,
        refetchOnWindowFocus: false
    })
}

export const useGetDeuda = (clienteRuc: string) => {
    return useQuery({
        queryKey: ['deuda', clienteRuc],
        queryFn: ()=> ClientesRepository.getDeuda(clienteRuc),
        enabled: true,
        refetchOnWindowFocus: false
    })
}