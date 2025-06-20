import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AgendasRepository } from "../../../api/agendaRepository";
import { useToast } from "@chakra-ui/react";

export const useRegistrarSalida = () => {
    const toast = useToast();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (idAgenda: number) => AgendasRepository.registrarSalida(idAgenda),
        onSuccess: () => {
            toast({
                title: "Salida registrada",
                description: "La salida se ha registrado correctamente",
                status: "success",
            });
            queryClient.invalidateQueries({ queryKey: ["agendaPorId"] });
        },
    });
};