import { useQuery } from "@tanstack/react-query";
import { PresupuestoRepository } from "../../api/presupuestosRepository";

export const useGetPresupuestosPorCliente = (clienteRuc: string) => {
    return useQuery({
        queryKey: ["presupuestos", clienteRuc],
        queryFn: () => PresupuestoRepository.GetPresupuestosPorCliente(clienteRuc),
        enabled: !!clienteRuc,
    });
}