import { useState } from "react";
import { clientesApi } from "../services/clientesApi";
import { BusquedaDTO } from "../types/BusquedaDTO.type";
import { ClienteViewModel } from "../types/cliente.type";


interface UseGetClientes {
    clientes: ClienteViewModel[];
    loading: boolean;
    error: string | null;
    getClientes: (busqueda: BusquedaDTO) => Promise<void>;
}


export const useGetClientes = (): UseGetClientes => {
    const [clientes, setClientes] = useState<ClienteViewModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const getClientes = async   (busqueda: BusquedaDTO) => {
        try {
            setLoading(true);
            const clientes = await clientesApi.getClientes(busqueda);
            setClientes(clientes);
            setLoading(false);
        } catch (error) {
            setError("Error al obtener clientes");
            setLoading(false);
        }
    }

    return { clientes, loading, error, getClientes };
    
    
}

