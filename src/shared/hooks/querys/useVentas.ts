import { useQuery } from "@tanstack/react-query";
import { VentasRepository } from "../../api/ventasRepository";

export const useUltimaVentaId = () => {
    return useQuery({
        queryKey: ['ultimaVentaId'],
        queryFn: () => VentasRepository.GetUltimaVentaId(),
    });
}