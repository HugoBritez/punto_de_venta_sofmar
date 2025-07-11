import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { VentasRepository } from "../../../api/ventasRepository";
import type { ActualizarMetaAcordadaDTO, ActualizarMetaGeneralDTO } from "../../../types/venta";

export const useActualizarMetaAcordada = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    
    return useMutation({
        mutationFn: (data: ActualizarMetaAcordadaDTO) => VentasRepository.ActualizarMetaAcordada(data),
        onSuccess: () => {
            toast({
                title: "Meta actualizada",
                description: "La meta acordada se ha actualizado correctamente",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries({ queryKey: ["reporte-movimiento-articulos"] });
        },

    })
}

export const useActualizarMetaGeneral = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    
    return useMutation({
        mutationFn: (data: ActualizarMetaGeneralDTO) => VentasRepository.ActualizarMetaGeneral(data),
        onSuccess: () => {
            toast({
                title: "Meta actualizada",
                description: "La meta general se ha actualizado correctamente",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries({ queryKey: ["reporte-movimiento-articulos"] });
        },

    })
}


