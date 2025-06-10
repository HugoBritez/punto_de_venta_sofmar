import { useQuery } from "@tanstack/react-query";
import { getZonas } from "@/repos/zonasRepository";


export const useZonas = (busqueda?: string) => {
        return useQuery({
                queryKey: ['zonas', busqueda],
                queryFn: () => getZonas(busqueda),
                enabled: true,
                refetchOnWindowFocus: false
        });

}