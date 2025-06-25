import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmarIngresoDTO, VerificarCompraDTO } from "@/shared/types/controlIngreso";
import { controlIngresosRepository } from "@/shared/api/controlIngresoRepository";
import { VerificacionItemDTO } from "@/shared/types/controlIngreso";

export const useVerificarCompra = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (verificacionCompraDTO: VerificarCompraDTO) => {
            return controlIngresosRepository.VerificarCompra(verificacionCompraDTO);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ingresos"] });
        }
    });
}

export const useVerificarItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (verificacionItemDTO: VerificacionItemDTO) => {
            return controlIngresosRepository.VerificarItem(verificacionItemDTO);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["detalleIngreso"] });
        }
    });
}


export const useConfirmarIngreso = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (confirmarIngresoDTO: ConfirmarIngresoDTO) => {
            return controlIngresosRepository.ConfirmarIngreso(confirmarIngresoDTO);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ingresos"] });
        }
    });
}