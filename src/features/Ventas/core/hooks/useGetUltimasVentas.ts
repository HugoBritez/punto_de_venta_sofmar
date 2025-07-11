import { useQuery } from "@tanstack/react-query";
import { getUltimasVentas } from "../services/ventasApi";

export const useGetUltimasVentas = (cliente?: number, articulo?: number) => {
    return useQuery({
        queryKey: ['ultimas-ventas', cliente, articulo],
        queryFn: () => getUltimasVentas(cliente, articulo),
        enabled: !!cliente
    })
}