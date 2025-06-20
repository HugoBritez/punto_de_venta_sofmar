import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RegistrarLlegadaDTO } from "../../../types/agendas";
import { AgendasRepository } from "../../../api/agendaRepository";
import { useToast } from "@chakra-ui/react";

export const useRegistrarLlegada = () => {
    const toast = useToast();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (agenda: RegistrarLlegadaDTO) => AgendasRepository.registrarLlegada(agenda),
        onSuccess: () => {
            toast({
                title: "Llegada registrada",
                description: "La llegada se ha registrado correctamente",
                status: "success",
            });
            queryClient.invalidateQueries({ queryKey: ["agendaPorId"] });
        },
    });
};