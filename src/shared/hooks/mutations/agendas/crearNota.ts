import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AgendasRepository } from "../../../api/agendaRepository";
import type { AgendaNotasViewModel } from "../../../types/agendas";
import { useToast } from "@chakra-ui/react";

export const useCrearNota = () => {
    const toast = useToast();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (nota: AgendaNotasViewModel) => AgendasRepository.crearNota(nota),
        onSuccess: () => {
            toast({
                title: "Nota creada",
                description: "La nota se ha creado correctamente",
                status: "success",
            });
            queryClient.invalidateQueries({ queryKey: ["notasAgenda"] });
        },
    });
};