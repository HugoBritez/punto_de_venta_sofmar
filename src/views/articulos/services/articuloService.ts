import { Articulo } from "../types/articulo.type";
import axios from "axios";
import { api_url } from "@/utils";

export const articuloService = {
    async crearArticulo(articulo: Omit<Articulo, "ar_codigo">) {
        try{
            const response = await axios.post(`${api_url}/articulo`, articulo);
            return response.data.body;
        } catch (error) {
            console.error("Error al crear el articulo", error);
            throw error;
        }
    },

    async modificarArticulo( codigo: number, articulo: Partial<Articulo>){
        try{
            const response = await axios.put(`${api_url}/articulo/${codigo}`, articulo);
            return response.data.body;
        } catch (error) {
            console.error("Error al modificar el articulo", error);
            throw error;
        }
    }
}
