import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPermisos } from "@/services/PermisosServices";

const usePermisos = (menuId: number) => {
    const [tienePermisos, setTienePermisos] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const traerPermisos = async () => {
            try {
                const permisos = await getPermisos(menuId);
                if (permisos.length > 0 && permisos[0].a_acceso === 1) {
                    setTienePermisos(true);
                } else {
                    navigate('/404');
                }
            } catch (error) {
                console.error('Error fetching permissions:', error);
                navigate('/404');
            } finally {
                setLoading(false);
            }
        };
        traerPermisos();
    }, [menuId, navigate]);

    return { tienePermisos, loading };
}

export default usePermisos;