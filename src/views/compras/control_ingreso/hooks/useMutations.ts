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
            queryClient.invalidateQueries({ queryKey: ["detalleIngreso"] });
        }
    });
}

export const useVerificarItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (verificacionItemDTO: VerificacionItemDTO) => {
            console.log('Hook useVerificarItem: Datos a enviar', verificacionItemDTO);
            return controlIngresosRepository.VerificarItem(verificacionItemDTO);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ingresos"] });
            queryClient.invalidateQueries({ queryKey: ["detalleIngreso"] });
        },
        onError: (error: any) => {
            console.error('Error en useVerificarItem hook:', error);
            console.error('Datos del error:', error.response?.data);
            console.error('Status del error:', error.response?.status);
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
            queryClient.invalidateQueries({ queryKey: ["detalleIngreso"] });
        },
        onError: (error: any) => {
            console.error('Error en useConfirmarIngreso hook:', error);
            console.error('Datos del error:', error.response?.data);
            console.error('Status del error:', error.response?.status);
            
            // Re-lanzar el error para que el componente pueda manejarlo
            throw error;
        }
    });
}