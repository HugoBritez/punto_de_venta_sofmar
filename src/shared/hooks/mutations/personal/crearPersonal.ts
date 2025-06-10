import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CrearPersonaDTO } from "@/models/dtos/CrearPersonaDTO";
import { crearPersona } from "@/repos/crearPersonaRepository";

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