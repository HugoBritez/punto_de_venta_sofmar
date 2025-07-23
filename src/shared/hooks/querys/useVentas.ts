import { useQuery } from "@tanstack/react-query";
import { VentasRepository } from "../../api/ventasRepository";

export const useUltimaVentaId = () => {
    return useQuery({
        queryKey: ['ultimaVentaId'],
        queryFn: () => VentasRepository.GetUltimaVentaId(),
    });
}


export const useUltimasVentasPorCliente = (clienteRuc: string) => {
    return useQuery({
        queryKey: ['ultimas-ventas-por-cliente', clienteRuc],
        queryFn: () => VentasRepository.getUltimasVentasPorCliente(clienteRuc),
        enabled: !!clienteRuc,
    });
}