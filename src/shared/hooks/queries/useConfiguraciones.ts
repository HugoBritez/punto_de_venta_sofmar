import { useQuery } from "@tanstack/react-query";
import { ConfiguracionesRepository } from "@/repos/configuracionesRepository";

export const useTipoImpresion = () => {
    return useQuery({
        queryKey: ['configuracionTipoImpresion'],
        queryFn: ()=> ConfiguracionesRepository.getConfiguracionById(6),
        enabled: true,
        refetchOnWindowFocus: false,
    })
}


export const useClientePorDefecto = () => {
    return useQuery({
        queryKey: ['configuracionClientePorDefecto'],
        queryFn: () => ConfiguracionesRepository.getConfiguracionById(63),
        enabled: true,
        refetchOnWindowFocus: false,
        refetchOnMount: false, // No re-fetch al re-montar si ya hay datos en cache
        refetchOnReconnect: false, // No re-fetch al reconectar internet
        staleTime: Infinity, // Los datos nunca se consideran "obsoletos"
    })
}


export const usePrecioPorDefecto = () => {
    return useQuery({
        queryKey: ['configuracionesPrecioPorDefecto'],
        queryFn: () => ConfiguracionesRepository.getConfiguracionById(50),
        enabled: true,
        refetchOnWindowFocus: false,
        refetchOnMount: false, // No re-fetch al re-montar si ya hay datos en cache
        refetchOnReconnect: false, // No re-fetch al reconectar internet
        staleTime: Infinity, // Los datos nunca se consideran "obsoletos"
    })
}

