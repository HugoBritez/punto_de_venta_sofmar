import { direccionesApi } from "../services/direccionesApi";
import { useState } from "react";
import { UbicacionDTO, AgrupacionDTO, Ubicacion } from "../types/ubicaciones.type";

interface UbicacionResponse {
    body: Ubicacion[];
    error: string | null;
    status: number;
}

export const useDirecciones = () => {
    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
    const [ubicacionesAgrupadas, setUbicacionesAgrupadas] = useState<Ubicacion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorCrearUbicacion, setErrorCrearUbicacion] = useState<string | null>(null);
    const [loadingAgrupaciones, setLoadingAgrupaciones] = useState(false);
    const [errorAgrupaciones, setErrorAgrupaciones] = useState<string | null>(null);
    const [errorAgruparDirecciones, setErrorAgruparDirecciones] = useState<string | null>(null);

    const obtenerUbicaciones = async (busqueda?: string): Promise<UbicacionResponse> => {
        try{
            setLoading(true);
            const response = await direccionesApi.obtenerUbicaciones(busqueda);
            setUbicaciones(response);
            setLoading(false);
            return {
                body: response,
                error: null,
                status: 200
            };
        } catch (error) {
            console.error("Error al obtener las ubicaciones", error);
            setError("Error al obtener las ubicaciones");
            setLoading(false);
            return {
                body: [],
                error: "Error al obtener las ubicaciones",
                status: 500
            };
        }
    }

    const crearUbicaciones = async (direccion: UbicacionDTO) => {
        try{
            if(direccion.d_calle_inicial === ''){
                setErrorCrearUbicacion("La calle inicial es requerida");
                return;
            }
            if(direccion.d_calle_final === ''){
                setErrorCrearUbicacion("La calle final es requerida");
                return;
            }
            if( direccion.d_predio_inicial === 0 || direccion.d_predio_final === 0 ){
                setErrorCrearUbicacion("El predio inicial y final son requeridos");
                return;
            }
            if( direccion.d_predio_inicial > direccion.d_predio_final ){
                setErrorCrearUbicacion("El predio inicial no puede ser mayor al predio final");
                return;
            }
            if( direccion.d_predio_inicial < 0 || direccion.d_predio_final < 0 ){
                setErrorCrearUbicacion("El predio inicial y final no pueden ser negativos");
                return;
            }
            if(direccion.d_piso_inicial === 0 || direccion.d_piso_final === 0){
                setErrorCrearUbicacion("El piso inicial y final son requeridos");
                return;
            }
            if(direccion.d_piso_inicial > direccion.d_piso_final){
                setErrorCrearUbicacion("El piso inicial no puede ser mayor al piso final");
                return;
            }
            if(direccion.d_piso_inicial < 0 || direccion.d_piso_final < 0){
                setErrorCrearUbicacion("El piso inicial y final no pueden ser negativos");
                return;
            }
            if(direccion.d_direccion_inicial === 0 || direccion.d_direccion_final === 0){
                setErrorCrearUbicacion("La direccion inicial y final son requeridas");
                return;
            }
            if(direccion.d_direccion_inicial > direccion.d_direccion_final){
                setErrorCrearUbicacion("La direccion inicial no puede ser mayor a la direccion final");
                return;
            }
            if(direccion.d_direccion_inicial < 0 || direccion.d_direccion_final < 0){
                setErrorCrearUbicacion("La direccion inicial y final no pueden ser negativas");
                return;
            }
            setLoading(true);
            const response = await direccionesApi.crearUbicaciones(direccion);
            setUbicaciones([...ubicaciones, response.body]);
            setLoading(false);
        } catch (error) {
            console.error("Error al crear la direccion", error);
            setError("Error al crear la direccion");
            setLoading(false);
        }
    }

    const eliminarDireccion = async (rango: Omit<UbicacionDTO, 'd_tipo_direccion' | 'd_estado'>) => {
        try{
            await direccionesApi.eliminarDireccion(rango);
        } catch (error) {
            console.error("Error al eliminar la direccion", error);
            setError("Error al eliminar la direccion");
        }
    }

    const agruparDirecciones = async (agrupacion: AgrupacionDTO) => {
        try{
            if(agrupacion.zona === 0){
                setErrorAgruparDirecciones("La zona es requerida");
                return;
            }
            if (agrupacion.rango.d_calle_inicial === "") {
              setErrorCrearUbicacion("La calle inicial es requerida");
              return;
            }
            if (agrupacion.rango.d_calle_final === "") {
              setErrorCrearUbicacion("La calle final es requerida");
              return;
            }
            if (
              agrupacion.rango.d_predio_inicial === 0 ||
              agrupacion.rango.d_predio_final === 0
            ) {
              setErrorCrearUbicacion(
                "El predio inicial y final son requeridos"
              );
              return;
            }
            if (agrupacion.rango.d_predio_inicial > agrupacion.rango.d_predio_final) {
              setErrorCrearUbicacion(
                "El predio inicial no puede ser mayor al predio final"
              );
              return;
            }
            if (agrupacion.rango.d_predio_inicial < 0 || agrupacion.rango.d_predio_final < 0) {
              setErrorCrearUbicacion(
                "El predio inicial y final no pueden ser negativos"
              );
              return;
            }
            if (agrupacion.rango.d_piso_inicial === 0 || agrupacion.rango.d_piso_final === 0) {
              setErrorCrearUbicacion("El piso inicial y final son requeridos");
              return;
            }
            if (agrupacion.rango.d_piso_inicial > agrupacion.rango.d_piso_final) {
              setErrorCrearUbicacion(
                "El piso inicial no puede ser mayor al piso final"
              );
              return;
            }
            if (agrupacion.rango.d_piso_inicial < 0 || agrupacion.rango.d_piso_final < 0) {
              setErrorCrearUbicacion(
                "El piso inicial y final no pueden ser negativos"
              );
              return;
            }
            if (
              agrupacion.rango.d_direccion_inicial === 0 ||
              agrupacion.rango.d_direccion_final === 0
            ) {
              setErrorCrearUbicacion(
                "La direccion inicial y final son requeridas"
              );
              return;
            }
            if (agrupacion.rango.d_direccion_inicial > agrupacion.rango.d_direccion_final) {
              setErrorCrearUbicacion(
                "La direccion inicial no puede ser mayor a la direccion final"
              );
              return;
            }
            if (
              agrupacion.rango.d_direccion_inicial < 0 ||
              agrupacion.rango.d_direccion_final < 0
            ) {
              setErrorCrearUbicacion(
                "La direccion inicial y final no pueden ser negativas"
              );
              return;
            }
            setLoadingAgrupaciones(true);
            const response = await direccionesApi.agruparDirecciones(agrupacion);
            setUbicacionesAgrupadas(response.body);
            setLoadingAgrupaciones(false);
        } catch (error) {
            console.error("Error al agrupar las direcciones", error);
            setErrorAgrupaciones("Error al agrupar las direcciones");
            setLoadingAgrupaciones(false);
        }
    }

    const getUbicacionesAgrupadas = async (busqueda: string, zona?: number) => {
        try{
            setLoadingAgrupaciones(true);
            const response = await direccionesApi.obtenerUbicaciones(busqueda, zona);
            setUbicacionesAgrupadas(response);
            setLoadingAgrupaciones(false);
        } catch (error) {
            console.error("Error al obtener las ubicaciones agrupadas", error);
            setErrorAgrupaciones("Error al obtener las ubicaciones agrupadas");
            setLoadingAgrupaciones(false);
        }
    }

    return {
        ubicaciones,
        ubicacionesAgrupadas,
        loading,
        error,
        errorCrearUbicacion,
        loadingAgrupaciones,
        errorAgrupaciones,
        errorAgruparDirecciones,
        obtenerUbicaciones,
        crearUbicaciones,
        agruparDirecciones,
        getUbicacionesAgrupadas,
        eliminarDireccion
    }
}
