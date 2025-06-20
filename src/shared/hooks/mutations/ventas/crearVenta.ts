import type { DetalleVenta, Venta } from "../../../types/venta";
import { VentasRepository } from "../../../api/ventasRepository";
import { useMutation } from "@tanstack/react-query";

export const useCrearVenta = () => {
    return useMutation({
        mutationFn: async (params: { venta: Venta, detalle: DetalleVenta[] }) => {
            return await VentasRepository.CrearVenta(params.venta, params.detalle);
        },
        onSuccess: (data) => {
            return data;
        }
    });
}