import { useState } from "react";
import { DatosFacturacion, getDatosFacturacion } from "../services/facturasApi";


export const useGetFacturas = () => {
    const [datosFacturacion, setDatosFacturacion] = useState<DatosFacturacion | null>(null);
    
    const obtenerDatosFacturacion = async () => {
        try {
            const operador = sessionStorage.getItem('user_id');
            if (!operador) {
                throw new Error('No se encontró el operador');
            }
            const response = await getDatosFacturacion(operador);
            if (response.body && response.body.length > 0) {
                const datos = response.body[0];
                setDatosFacturacion({
                    d_establecimiento: datos.d_establecimiento,
                    d_p_emision: datos.d_p_emision,
                    d_nro_secuencia: datos.d_nro_secuencia + 1,
                    d_nrotimbrado: datos.d_nrotimbrado,
                    d_codigo: datos.d_codigo
                });
            } else {
                throw new Error('No se encontraron datos de facturación');
            }
        } catch (error) {
            console.log(error);
        }
    }

    return {
        datosFacturacion,
        obtenerDatosFacturacion
    }
    
    
    
}