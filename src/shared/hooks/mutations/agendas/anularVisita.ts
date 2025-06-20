import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AgendasRepository } from "../../../api/agendaRepository";
import { useToast } from "@chakra-ui/react";

export const useAnularVisita = () => {
    const toast = useToast();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (idAgenda: number) => AgendasRepository.anularVisita(idAgenda),
        onSuccess: () => {
            toast({
                title: "Visita anulada",
                description: "La visita se ha anulado correctamente",
                status: "success",
            });
            queryClient.invalidateQueries({ queryKey: ["agendaPorId"] });
        },
    });
};