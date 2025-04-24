import { useListaPreciosStore } from "@/stores/listaPreciosStore";
import { useEffect } from "react";
import { useState } from "react";

export const useListasDePrecios = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { listaPrecios, fetchListaPrecios } = useListaPreciosStore();

    const obtenerListaPrecios = async () => {
        try {
            setLoading(true);
            await fetchListaPrecios();
            setLoading(false);
        } catch (error) {
            setError(error as string);
        }
    }

    useEffect(() => {
        if (listaPrecios.length === 0) {
            obtenerListaPrecios();
        }
    }, []);

    return { listaPrecios, loading, error, obtenerListaPrecios };
}