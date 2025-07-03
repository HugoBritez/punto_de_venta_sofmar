import type { DetalleVenta, Venta } from "../../../types/venta";
import { VentasRepository } from "../../../api/ventasRepository";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCrearVenta = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (params: { venta: Venta, detalle: DetalleVenta[] }) => {
            return await VentasRepository.CrearVenta(params.venta, params.detalle);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['ultimaVentaId', 'ventas'] });
            return data; 
        },
        onError: (error) => {
            console.log('error', error);
        }
    });
}