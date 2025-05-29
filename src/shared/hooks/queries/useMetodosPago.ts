import { useQuery } from "@tanstack/react-query";
import { metodosPagoRepository } from "@/repos/metodosPagoRepository";


export const useMetodosPago = (busqueda? : string) =>{
    return useQuery({
        queryKey: ['metodospago', busqueda],
        queryFn: () => metodosPagoRepository.getMetodos(busqueda),
        enabled: true,
        refetchOnWindowFocus: false,
    })
}