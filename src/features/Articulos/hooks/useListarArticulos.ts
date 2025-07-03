import { useQuery } from "@tanstack/react-query";
import { getListaArticulos, getListaParams } from "../api/getListaArticulos";

export const useListarArticulos = (params: getListaParams) => {
    return useQuery({
        queryKey: ['articulos-lista', params],
        queryFn: () => getListaArticulos(params),
        staleTime: 1000 * 60,
        enabled: true,
    })
}