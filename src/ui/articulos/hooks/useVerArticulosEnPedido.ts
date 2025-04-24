import { useState, useEffect } from "react";
import { getArticulosEnPedido } from "../services/articulosEnPedidoService";
import { ArticuloPedido } from "../types/articulopedido.type";


export const useVerArticulosEnPedido = (articulo_id: number, id_lote: number) => {
    const [articulosEnPedido, setArticulosEnPedido] = useState<ArticuloPedido[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchArticulosEnPedido = async () => {
            setCargando(true);
            setError(null);
            try{
                const articulos = await getArticulosEnPedido(articulo_id, id_lote);
                console.log("articulos en pedido en el hook", articulos);
                setArticulosEnPedido(articulos);
            }catch(error){
                console.error("Error al obtener articulos en pedido:", error);
                setError("Error al obtener articulos en pedido");
            }finally{
                setCargando(false);
            }
        }
        fetchArticulosEnPedido();
    }, [articulo_id, id_lote]);

    return {
        articulosEnPedido,
        cargando,
        error
    }
}

export default useVerArticulosEnPedido;
