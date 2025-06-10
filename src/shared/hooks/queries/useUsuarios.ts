import { useQuery } from "@tanstack/react-query";
import { UsuarioRepository } from "@/repos/usuarioRepository";
import { UsuarioViewModel } from "@/models/viewmodels/usuarioViewModel";

export const useUsuarios = (busqueda?: string) => {
    return useQuery<UsuarioViewModel[]>({
        queryKey: ['usuarios', busqueda],
        queryFn: async () => {
            const response = await UsuarioRepository.GetUsuarios(busqueda);
            return response.body;
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
            console.log("Vendedor seleccionado por id desde el hook", usuario);
            return usuario;
        },
        enabled: !!id,
        refetchOnWindowFocus: false
    });
}