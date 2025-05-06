import { getConfiguracionesPorId } from "./configuracionesApi";
import { Configuracion } from "./configuracion.type";
import { useEffect, useState } from "react";

export const useConfiguraciones = () => {
    const [clientePorDefecto, setClientePorDefecto] = useState<Configuracion>();




    useEffect(() => {
        const fetchClientePorDefecto = async () => {
            try{
                const clientePorDefecto = await getConfiguracionesPorId(63);
                setClientePorDefecto(clientePorDefecto);
            } catch (error) {
                console.error("Error al obtener el cliente por defecto", error);
                setClientePorDefecto({
                    error: true,
                    status: 500,
                    body: [{
                        id: 0,
                        descripcion: "No se pudo obtener el cliente por defecto",
                        valor: "1"
                    }]
                });
            }
        }
        fetchClientePorDefecto();
    }, []);

    return { clientePorDefecto };
}
