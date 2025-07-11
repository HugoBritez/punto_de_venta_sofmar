import { useQuery } from "@tanstack/react-query";
import { getVentasConFiltros, FiltrosVentas } from "../services/ventasApi";

export const useGetVentasConFiltros = (filtros: FiltrosVentas) => {
    return useQuery({
        queryKey: ['ventas-con-filtros', filtros],
        queryFn: () => getVentasConFiltros(filtros),
        enabled: true // Siempre habilitado ya que no requiere cliente específico
    });
};