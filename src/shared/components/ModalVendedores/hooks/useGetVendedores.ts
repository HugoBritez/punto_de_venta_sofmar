import { UsuarioViewModel } from "../../../types/operador";
import { useState } from "react";
import { getVendedores as getVendedoresApi } from "../services/vendedoresApi";

interface UseGetVendedores {
    vendedores: UsuarioViewModel[];
    loadingVendedores: boolean;
    errorVendedores: string | null;
    getVendedores: (busqueda: string) => Promise<void>;
}

export const useGetVendedores = (): UseGetVendedores => {
    const [vendedores, setVendedores] = useState<UsuarioViewModel[]>([]);
    const [loadingVendedores, setLoadingVendedores] = useState(false);
    const [errorVendedores, setErrorVendedores] = useState<string | null>(null);

    const getVendedores = async (busqueda: string) => {
        try{
            setLoadingVendedores(true);
            const vendedores = await getVendedoresApi(busqueda);
            setVendedores(vendedores as UsuarioViewModel[]);
            setLoadingVendedores(false);
        } catch (error) {
            setErrorVendedores("Error al obtener vendedores");
            setLoadingVendedores(false);
        }
    }

    return { vendedores, loadingVendedores, errorVendedores, getVendedores };
}