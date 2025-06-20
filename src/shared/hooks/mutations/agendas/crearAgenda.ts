import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AgendasRepository } from "../../../api/agendaRepository";
import type { AgendaDTO } from "../../../types/agendas";
import { useToast } from "@chakra-ui/react";

export const useCrearAgenda = () => {
    const toast = useToast();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (agenda: AgendaDTO) => AgendasRepository.crearVisita(agenda),
        onSuccess: () => {
            toast({
                title: "Agenda creada",
                description: "La agenda se ha creado correctamente",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            queryClient.invalidateQueries({ queryKey: ["agendas"] });
        },
    });
};