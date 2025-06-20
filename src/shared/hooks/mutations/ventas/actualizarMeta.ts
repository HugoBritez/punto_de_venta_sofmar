import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VentasRepository } from "../../../api/ventasRepository";
import type { ActualizarMetaAcordadaDTO } from "../../../types/venta";

export const useActualizarMetaAcordada = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ActualizarMetaAcordadaDTO) => VentasRepository.ActualizarMetaAcordada(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reporte-movimiento-articulos"] });
        }
    })
}