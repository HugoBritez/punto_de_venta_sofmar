import { getConfiguracionesPorId } from "./configuracionesApi";
import { useEffect, useState } from "react";
import { ConfiguracionViewModel } from "@/models/viewmodels/ConfiguracionesViewModel";

export const useConfiguraciones = () => {
    const [clientePorDefecto, setClientePorDefecto] = useState<ConfiguracionViewModel>();




    useEffect(() => {
        const fetchClientePorDefecto = async () => {
            try{
                const clientePorDefecto = await getConfiguracionesPorId(63);
                console.log("Cliente por defecto obtenido:", clientePorDefecto);
                setClientePorDefecto(clientePorDefecto);
            } catch (error) {
                console.error("Error al obtener el cliente por defecto", error);
                setClientePorDefecto({

                        id: 0,
                        descripcion: "No se pudo obtener el cliente por defecto",
                        valor: "1"
                });
            }
        }
        fetchClientePorDefecto();
    }, []);

    return { clientePorDefecto };
}
