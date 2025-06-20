import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AgendasRepository } from "../../../api/agendaRepository";
import type { ReagendarVisitaDTO } from "../../../types/agendas";
import { useToast } from "@chakra-ui/react";

export const useReagendarAgenda = () => {
    const toast = useToast();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (agenda: ReagendarVisitaDTO) => AgendasRepository.reagendarVisita(agenda),
        onSuccess: () => {
            toast({
                title: "Agenda reagendada",
                description: "La agenda se ha reagendado correctamente",
                status: "success",
            });
            queryClient.invalidateQueries({ queryKey: ["agendaPorId"] });
        },
    });
};