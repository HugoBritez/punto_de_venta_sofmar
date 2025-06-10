import { useQuery } from "@tanstack/react-query";
import { getSucursales } from "@/repos/sucursalApi";
import { SucursalViewModel } from "@/models/viewmodels/sucursalViewModel";
import { getSucursalDTO } from "@/models/dtos/getSucursalesDTO";


export const useSucursales = (params? : getSucursalDTO) =>{
    return useQuery({
        queryKey: ['sucursales', params],
        queryFn: () => getSucursales(params),
        enabled: true,
        refetchOnWindowFocus: false,
        select: (data) => Array.isArray(data) ? data as SucursalViewModel[] : [data as SucursalViewModel]
    })
}