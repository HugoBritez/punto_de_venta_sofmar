import { useState } from "react";
import { direccionesApi } from "../services/direccionesApi";
import { UbicacionDTO } from "../types/ubicaciones.type";
import { Rotulo } from "../types/rotulo.type";


export const useRotulos = () =>{
    const [rotulos, setRotulos] = useState<Rotulo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const obtenerRotulos = async (rango: Omit<UbicacionDTO, 'd_tipo_direccion' | 'd_estado'>) =>{
        try{
            setLoading(true);
            const response = await direccionesApi.obtenerRotulos(rango);
            setRotulos(response);
            setLoading(false);
        } catch (error) {
            console.error("Error al obtener los rotulos", error);
            setError("Error al obtener los rotulos");
            setLoading(false);
        }
    }
    
    return {
        rotulos,
        loading,
        error,
        obtenerRotulos
    }
}
