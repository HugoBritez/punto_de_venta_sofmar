import { useQuery } from "@tanstack/react-query";
import { getCiudades } from "@/repos/ciudadesRepository";
import { Ciudad } from "@/models/viewmodels/CiudadViewModel";

export const useGetCiudades = (busqueda?: string) => {
    return useQuery<Ciudad[]>({
        queryKey: ['ciudades', busqueda],
        queryFn:  ()=> getCiudades(busqueda),
        enabled: true,
        refetchOnWindowFocus: false
    })
}