import axios from "axios";
import { api_url } from "@/utils";
import { UbicacionDTO, AgrupacionDTO, Ubicacion, ItemsPorDireccionDTO } from "../types/ubicaciones.type";

export const direccionesApi = {
    async obtenerUbicaciones(busqueda?: string, zona?: number): Promise<Ubicacion[]> {
        try{

            const response = await axios.get(`${api_url}direcciones/`,
                {
                    params: {
                        busqueda,
                        zona
                    }
                }
            );
            console.log(response.data.body);
            return response.data.body;
        } catch (error) {
            console.error("Error al obtener las ubicaciones", error);
            throw error;
        }
    },

    async crearUbicaciones(direccion: UbicacionDTO) {
        try{
            const response = await axios.post(`${api_url}direcciones/`, direccion);
            return response.data.body;
        } catch (error) {
            console.error("Error al crear la direccion", error);
            throw error;
        }
    },

    async eliminarDireccion(rango: Omit<UbicacionDTO, 'd_tipo_direccion' | 'd_estado'>) {
        try{
            const response = await axios.delete(`${api_url}direcciones/`, {params: {rango}});
            return response.data.body;
        } catch (error) {
            console.error("Error al eliminar la direccion", error);
            throw error;
        }
    },

    
    async agruparDirecciones(agrupacion: AgrupacionDTO) {
        try{
            const response = await axios.post(`${api_url}direcciones/agrupar`, agrupacion);
            return response.data.body;
        } catch (error) {
            console.error("Error al agrupar las direcciones", error);   
            throw error;
        }
    },

    async obtenerItemsPorDireccion(rango?: UbicacionDTO, busqueda?: string) {
        try{
            const response = await axios.get(`${api_url}direcciones/articulos`, { params: {rango, busqueda}});
            console.log(response.data.body);
            return response.data.body;
        } catch (error) {
            console.error("Error al obtener los items por direccion", error);
            throw error;
        }
    },

    async crearItemsPorDireccion(datos: ItemsPorDireccionDTO) {
        try{
            const response = await axios.post(`${api_url}direcciones/articulo`, datos);
            return response.data.body;
        } catch (error) {
            console.error("Error al crear los items por direccion", error);
            throw error;
        }
    },

    async eliminarItemsPorDireccion(rango: Omit<UbicacionDTO, 'd_tipo_direccion' | 'd_estado'>, articulo: number) {
        try{
            console.log('rango en api', rango);
            console.log('articulo en api', articulo);
            const response = await axios.delete(`${api_url}direcciones/articulo`, {params: {rango, articulo}});
            return response.data.body;
        } catch (error) {
            console.error("Error al eliminar los items por direccion", error);
            throw error;
        }
    }
}
