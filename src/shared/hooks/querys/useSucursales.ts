import { useQuery } from "@tanstack/react-query";
import { getSucursales } from "../../api/sucursalApi";
import type { SucursalViewModel } from "../../types/sucursal";
import type { getSucursalDTO } from "../../types/sucursal";


export const useSucursales = (params? : getSucursalDTO) =>{
    return useQuery({
        queryKey: ['sucursales', params],
        queryFn: () => getSucursales(params),
        enabled: true,
        refetchOnWindowFocus: false,
        select: (data) => Array.isArray(data) ? data as SucursalViewModel[] : [data as SucursalViewModel]
    })
}