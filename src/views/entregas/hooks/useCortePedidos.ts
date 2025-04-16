import { cortePedidosApi } from "../services/cortePedidosApi";
import { useState } from "react";
import { FiltrosPedidoFaltante, PedidoFaltante, RehacerPedidoDTO } from "../types/shared.type";

interface UseCortePedidos {
    loading: boolean;
    error: string | null;
    agregarPedidoFaltante: (detalle_id: number, cantidad: number, observacion?: string) => Promise<any>;
    obtenerPedidoFaltante: (filtros: FiltrosPedidoFaltante) => Promise<PedidoFaltante[]>;
    reprocesarPedido: (datos: RehacerPedidoDTO) => Promise<any>;
    pedidosFaltantes: PedidoFaltante[];
}


export const useCortePedidos = (): UseCortePedidos => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pedidosFaltantes, setPedidosFaltantes] = useState<PedidoFaltante[]>([]);

    const agregarPedidoFaltante = async (
        detalle_id: number,
        cantidad: number,
        observacion?: string
    ) => {
        try {
            setLoading(true);
            const response = await cortePedidosApi.agregarPedidoFaltante(detalle_id, cantidad, observacion);
            setLoading(false);
            return response;
        } catch (error) {
            setError("Error al agregar pedido faltante");
            setLoading(false);
        }
    }

    const obtenerPedidoFaltante = async (filtros: FiltrosPedidoFaltante): Promise<PedidoFaltante[]> => {
        try {
            setLoading(true);
            const response = await cortePedidosApi.getPedidoFaltante(filtros);
            console.log('response en el hook', response);
            setPedidosFaltantes(response);
            setLoading(false);
            return response;
        } catch (error) {
            setError("Error al obtener pedido faltante");
            setLoading(false);
            return [];
        }
    }

    const reprocesarPedido = async (datos: RehacerPedidoDTO) => {
        try {
            setLoading(true);
            const response = await cortePedidosApi.reprocesarPedido(datos);
            setLoading(false);
            return response;
        } catch (error) {
            setError("Error al reprocesar pedido");
            setLoading(false);
        }
    }

    return {
        agregarPedidoFaltante,
        obtenerPedidoFaltante,
        reprocesarPedido,
        loading,
        error,
        pedidosFaltantes
    };
};
