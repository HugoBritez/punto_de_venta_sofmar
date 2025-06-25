import { useQuery } from "@tanstack/react-query";
import { ingresosApi } from "../services/ingresosApi";
import { FiltrosDTO } from "../types/shared.type";

export const useGetIngresos =(params: FiltrosDTO) => {
    return useQuery({
        queryKey: ["ingresos", params],
        queryFn: () => ingresosApi.getIngresos(params),
        enabled: Boolean(params)
    })
}

export const useGetDetalleIngreso = (id_ingreso: number) => {
    return useQuery({
        queryKey: ["detalleIngreso", id_ingreso],
        queryFn: () => ingresosApi.getDetalleIngreso(id_ingreso),
        enabled: Boolean(id_ingreso)
    })
}