import api from "../../config/axios";
import type { UsuarioViewModel } from "../types/operador";

export const UsuarioRepository = {
    async GetUsuarios(busqueda?: string, rol?: number): Promise<UsuarioViewModel[]> {
        const response = await api.get(`usuarios`, { params: { busqueda, rol } });
        return response.data.body;
    },

    async GetUsuarioById(id: number): Promise<UsuarioViewModel> {
        console.log("corriendo funcion")
        const response = await api.get(`usuarios`, { params: { id } });
        if (response.data.body.length === 0) {
            throw new Error("Usuario no encontrado");
        }
        console.log( "Vendedor seleccionado por id desde el repo",response.data);
        return response.data.body[0];
    },
}