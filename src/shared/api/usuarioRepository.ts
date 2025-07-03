import api from "../../config/axios";
import type { UsuarioViewModel } from "../types/operador";

export const UsuarioRepository = {
    async GetUsuarios(busqueda?: string, rol?: number): Promise<UsuarioViewModel[]> {
        const response = await api.get(`usuarios`, { params: { busqueda, rol } });
        return response.data.body;
    },

    async GetUsuarioById(id: number): Promise<UsuarioViewModel> {
        const response = await api.get(`usuarios`, { params: { id } });
        if (response.data.body.length === 0) {
            throw new Error("Usuario no encontrado");
        }
        return response.data.body[0];
    },
}