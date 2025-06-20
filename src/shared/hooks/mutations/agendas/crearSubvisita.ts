import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AgendasRepository } from "../../../api/agendaRepository";
import type { SubvisitaViewModel } from "../../../types/agendas";
import { useToast } from "@chakra-ui/react";

export const useCrearSubvisita = () => {
    const toast = useToast();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (subvisita: SubvisitaViewModel) => AgendasRepository.crearSubvisita(subvisita),
        onSuccess: () => {
            toast({
                title: "Subvisita creada",
                description: "La subvisita se ha creado correctamente",
                status: "success",
            });
            queryClient.invalidateQueries({ queryKey: ["subvisitasAgenda"] });
        },
    });
};