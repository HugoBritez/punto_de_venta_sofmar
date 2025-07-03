import { useQuery } from "@tanstack/react-query";
import { UsuarioRepository } from "../../api/usuarioRepository";
import type { UsuarioViewModel } from "../../types/operador";

export const useUsuarios = (busqueda?: string, rol?: number) => {
    return useQuery<UsuarioViewModel[]>({
        queryKey: ['usuarios', busqueda, rol],
        queryFn: async () => {
            const response = await UsuarioRepository.GetUsuarios(busqueda, rol);
            return response;
        },
        enabled: true,
        refetchOnWindowFocus: false
    });
}

export const useUsuarioPorId = (id: number) => {
    return useQuery<UsuarioViewModel>({
        queryKey: ['usuario', id],
        queryFn: async () => {
            const usuario = await UsuarioRepository.GetUsuarioById(id);
            return usuario;
        },
        enabled: !!id,
        refetchOnWindowFocus: false
    });
}