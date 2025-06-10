import { UsuarioViewModel } from "@/models/viewmodels/usuarioViewModel";
import { ResponseViewModel } from "@/models/base/responseViewModel";
import axios from "axios";
import { api_url } from "@/utils";

export const UsuarioRepository = {
    async GetUsuarios(busqueda?: string): Promise<ResponseViewModel<UsuarioViewModel[]>> {
        const response = await axios.get(`${api_url}usuarios`, { params: { busqueda } });
        return response.data;
    },

    async GetUsuarioById(id: number): Promise<UsuarioViewModel> {
        console.log("corriendo funcion")
        const response = await axios.get(`${api_url}usuarios`, { params: { id } });
        if (response.data.body.length === 0) {
            throw new Error("Usuario no encontrado");
        }
        console.log( "Vendedor seleccionado por id desde el repo",response.data);
        return response.data.body[0];
    },
}