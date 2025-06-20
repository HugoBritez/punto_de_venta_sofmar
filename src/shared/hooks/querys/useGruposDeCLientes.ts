import { getGruposClientes } from "../../api/grupoClienteRepository"
import { useQuery } from "@tanstack/react-query"

export const useGetGruposDeClientes = () =>{
    return useQuery({
        queryKey: ['gruposClientes'],
        queryFn:  ()=>getGruposClientes(),
        refetchOnWindowFocus: false,
        enabled: true,
    })
}