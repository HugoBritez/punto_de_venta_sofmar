import { useQuery } from "@tanstack/react-query";
import { getCiudades } from "../../api/ciudadesRepository";
import type { Ciudad } from "../../types/ciudad";

export const useGetCiudades = (busqueda?: string) => {
    return useQuery<Ciudad[]>({
        queryKey: ['ciudades', busqueda],
        queryFn:  ()=> getCiudades(busqueda),
        enabled: true,
        refetchOnWindowFocus: false
    })
}