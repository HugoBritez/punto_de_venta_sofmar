import { getTipoPlazo } from "@/repos/tipoPlazoRepository"
import { useQuery } from "@tanstack/react-query"

export const useGetTipoPlazo = () =>{
    return useQuery({
        queryKey: ['tipoPlazo'],
        queryFn: ()=> getTipoPlazo(),
        enabled: true,
        refetchOnWindowFocus: false
    })
}