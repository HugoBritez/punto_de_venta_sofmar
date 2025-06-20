import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CrearPersonaDTO } from "../../../types/personas";
import { crearPersona } from "../../../api/crearPersonaRepository";

export const useCrearPersona = () => {

    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (datos: CrearPersonaDTO)=> {
            return await crearPersona(datos);
        },
        onSuccess: (data)=> {
            queryClient.invalidateQueries({ queryKey: ['personas'] });
            queryClient.invalidateQueries({ queryKey: ['ultimoCodigoInterno'] });
            return data;
        }
    })
}